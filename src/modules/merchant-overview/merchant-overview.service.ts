/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/overview/overview.service.ts

import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Connection, Model } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Request as ExpressRequest } from 'express';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { LogInventory, MerchantLogInventorySchema } from '../merchant-log/schemas/merchant-log-inventory.schema';
import { Inventory, InventorySchema } from '../merchant-inventory/schemas/inventory.schema';
import { MerchantUser, MerchantUserSchema } from '../merchant-user/schemas/merchant-user.schema';
// import { Material, MaterialSchema } from '../materials/schemas/material.schema';

@Injectable({ scope: Scope.REQUEST })
export class MerchantOverviewService extends BaseTenantService {
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST)request: ExpressRequest ,
  ) {
    super(connection, request);
    const dbName = connection.name || 'Unknown Database';
    const outletId = this.currentOutletId; // Menggunakan getter dari BaseTenantService
    console.log(`--- [Request Inbound] ---`);
    console.log(`📂 Database : ${dbName}`);
    console.log(`🏪 Outlet ID: ${outletId || 'TIDAK TERDETEKSI (Global/Owner)'}`);
    console.log(`--------------------------`);

  }
  // Getters Model
  private get productModel() { return this.getModel<Product>(Product.name, ProductSchema); }
  private get categoryModel() { return this.getModel<Category>(Category.name, CategorySchema); }
  private get transactionModel() { return this.getModel<Transaction>(Transaction.name, TransactionSchema); }
  private get journalModel() { return this.getModel<LogInventory>(LogInventory.name, MerchantLogInventorySchema); }
  private get inventoryModel() { return this.getModel<Inventory>(Inventory.name, InventorySchema); }
  private get userModel() { return this.getModel<Inventory>(MerchantUser.name, MerchantUserSchema); }
  // private get materialModel() { return this.getModel<Material>(Material.name, MaterialSchema); }

  async getGlobalStats() {
    // Kita jalankan semua query secara paralel (Promise.all) agar cepat 
    const [totalProducts, totalCategories, totalTransactions, totalEmployee, recentSales] = await Promise.all([ //totalMaterials,
      this.productModel.countDocuments(this.outletFilter),
      this.categoryModel.countDocuments(this.outletFilter),
      this.transactionModel.countDocuments(this.outletFilter),
      this.userModel.countDocuments(this.outletFilter),
      this.transactionModel.find(this.outletFilter).sort({ createdAt: -1 }).limit(5)
    ]);

    // Hitung total revenue (Contoh agregasi sederhana)
    const revenueData = await this.transactionModel.aggregate([
      { $match: this.outletFilter },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);

    return {
      stats: {
        products: totalProducts,
        categories: totalCategories,
        transactions: totalTransactions,
        employee: totalEmployee,
        // revenue: revenueData[0]?.total || 0,
      },
      recentSales
    };
  }

  /**
   * PILAR A: PERFORMA (UANG MASUK/KELUAR)
   * Mengambil data finansial dari Journal & Transaction
   */
  async getFinancialPerformance(startDate: Date, endDate: Date) {
    const filter = {
      ...this.outletFilter,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const stats = await this.journalModel.aggregate([
      { $match: { ...filter, domain: 'TRANSACTION' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_value' },
          uniqueOrders: { $addToSet: '$reference_id' },
        }
      },
      {
        $project: {
          totalRevenue: 1,
          orderCount: { $size: '$uniqueOrders' },
          aov: { $cond: [{ $eq: [{ $size: '$uniqueOrders' }, 0] }, 0, { $divide: ['$totalRevenue', { $size: '$uniqueOrders' }] }] }
        }
      }
    ]);

    // Hitung HPP dari Journal domain INVENTORY tipe RECIPE_CONSUMPTION atau SALE
    const hppData = await this.journalModel.aggregate([
      { $match: { ...filter, domain: 'INVENTORY', action_type: { $in: ['RECIPE_CONSUMPTION', 'SALE'] } } },
      { $group: { _id: null, totalHpp: { $sum: '$total_value' } } }
    ]);

    const revenue = stats[0]?.totalRevenue || 0;
    const hpp = hppData[0]?.totalHpp || 0;

    return {
      revenue,
      hpp,
      grossProfit: revenue - hpp,
      orderCount: stats[0]?.orderCount || 0,
      aov: stats[0]?.aov || 0
    };
  }

  /**
   * PILAR B: INVENTARIS (KESEHATAN STOK)
   */
  async getInventoryHealth() {
    // 1. Inventory Value (Current Asset)
    const invValue = await this.inventoryModel.aggregate([
      { $match: this.outletFilter },
      { $group: { _id: null, totalAsset: { $sum: { $multiply: ['$stock', '$average_cost'] } } } }
    ]);

    // 2. Dead Stock (Tidak ada pergerakan dalam 30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movingItems = await this.journalModel.distinct('reference_id', {
      ...this.outletFilter,
      domain: 'INVENTORY',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const deadStockCount = await this.inventoryModel.countDocuments({
      ...this.outletFilter,
      _id: { $nin: movingItems }
    });

    return {
      totalInventoryValue: invValue[0]?.totalAsset || 0,
      deadStockCount,
      lowStockAlert: await this.inventoryModel.countDocuments({
        ...this.outletFilter,
        $expr: { $lte: ['$stock', '$min_stock_alert'] }
      })
    };
  }

  /**
   * PILAR C: PRODUK & KATEGORI (MENU ENGINEERING)
   * Termasuk pengecekan kategori mana yang paling laku
   */
  async getProductAnalytics(limit = 5) {
    const bestSelling = await this.journalModel.aggregate([
      { $match: { ...this.outletFilter, domain: 'TRANSACTION', action_type: 'SALE' } },
      {
        $group: {
          _id: '$reference_id',
          totalQty: { $sum: '$quantity' },
          totalSales: { $sum: '$total_value' }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products', // sesuaikan dengan nama collection product
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $project: {
          name: '$productInfo.name',
          category: { $arrayElemAt: ['$categoryInfo.name', 0] },
          qty: '$totalQty',
          sales: '$totalSales'
        }
      }
    ]);

    // Analisa Kategori Terlaris
    const categorySales = await this.journalModel.aggregate([
        { $match: { ...this.outletFilter, domain: 'TRANSACTION' } },
        { $lookup: { from: 'products', localField: 'reference_id', foreignField: '_id', as: 'p' } },
        { $unwind: '$p' },
        { $lookup: { from: 'categories', localField: 'p.category_id', foreignField: '_id', as: 'c' } },
        { $unwind: '$c' },
        { $group: { _id: '$c.name', total: { $sum: '$total_value' }, qty: { $sum: '$quantity' } } },
        { $sort: { total: -1 } }
    ]);

    return {
      bestSellingProducts: bestSelling,
      salesByCategory: categorySales
    };
  }

  /**
   * Fungsi Wrapper untuk Dashboard Utama
   * Menggabungkan data penting dalam satu hit (opsional)
   */
  async getMainDashboard(rangeDays = 30) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - rangeDays);

    const [performance, inventory, products] = await Promise.all([
      this.getFinancialPerformance(start, end),
      this.getInventoryHealth(),
      this.getProductAnalytics()
    ]);

    return {
      performance,
      inventory,
      products,
      serverTime: new Date()
    };
  }


  // merchant-overview.service.ts

  async getJournalEntries(query: any) {
    const { search, domain, action_type, startDate, endDate } = query;

    const filter: any = {  };

    // Filter Domain & Action
    if (domain) filter.domain = domain;
    if (action_type) filter.action_type = action_type;

    // Filter Search pada Note
    if (search) filter.note = { $regex: search, $options: 'i' };

    // Filter Tanggal
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await this.journalModel
      .find(filter)
      .sort({ createdAt: -1 }) // Terbaru di atas
      .limit(100) // Batasi agar tidak berat
      .exec();

    return logs;
  }


  /**
   * Fungsi Wrapper untuk Dashboard Utama
   * Menggabungkan data penting dalam satu hit (opsional)
  */

  async getFullInventoryAnalytics(month: number, year: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const initDays = () => Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));

    // Helper untuk filter tanggal
    const dateFilter = {
      $gte: new Date(year, month - 1, 1),
      $lte: new Date(year, month, 0, 23, 59, 59)
    };

    const fetchByAction = async (actionTypes: string[], isNegative = false) => {
      const data = await this.journalModel.aggregate([
        { 
          $match: { 
            ...this.outletFilter,
            domain: 'INVENTORY',
            action_type: { $in: actionTypes },
            createdAt: dateFilter
          } 
        },
        { 
          $group: { 
            _id: { $dayOfMonth: '$createdAt' }, 
            total: { $sum: '$quantity' } 
          } 
        }
      ]);

      const dayMap = initDays();
      data.forEach(d => {
        const index = d._id - 1;
        if (dayMap[index]) {
          dayMap[index].count = isNegative ? Math.abs(d.total) : d.total;
        }
      });
      return dayMap;
    };

    // --- LOGIKA TREND STOK KUMULATIF ---
    // 1. Ambil stok awal (semua transaksi SEBELUM bulan ini)
    const openingBalanceResult = await this.journalModel.aggregate([
      { 
        $match: { 
          ...this.outletFilter, 
          domain: 'INVENTORY', 
          createdAt: { $lt: new Date(year, month - 1, 1) } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const openingBalance = openingBalanceResult[0]?.total || 0;

    // 2. Ambil semua mutasi harian bulan ini (tanpa filter action_type)
    const dailyMutations = await this.journalModel.aggregate([
      { $match: { ...this.outletFilter, domain: 'INVENTORY', createdAt: dateFilter } },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, dailySum: { $sum: '$quantity' } } },
      { $sort: { '_id': 1 } }
    ]);

    // 3. Hitung Running Total untuk Line Chart
    let currentRunningTotal = openingBalance;
    const stockTrend = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const found = dailyMutations.find(d => d._id === day);
      currentRunningTotal += (found ? found.dailySum : 0);
      return { day, count: currentRunningTotal };
    });

    return {
      // Grouping yang lebih rapi
      in: await fetchByAction(['RESTOCK','RESTOCK_SUPP', 'PURCHASE', 'STOCK_IN', 'ADJUSTMENT_IN']),
      out: await fetchByAction(['SALE', 'STOCK_OUT', 'ADJUSTMENT_OUT']),
      adjust: await fetchByAction(['ADJUSTMENT', 'WASTE']), // WASTE lebih cocok masuk adjustment/kerugian
      stock: stockTrend // Dataset untuk tombol "Total Stock"
    };
  }

}