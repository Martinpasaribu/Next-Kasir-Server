/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable function-paren-newline */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/agent-assistant/agent-assistant.service.tst/no-unsafe-assignment */

import { Injectable, Inject, Scope, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection, Types } from 'mongoose';

// Import All Schemas
import { Inventory, InventorySchema } from '../../merchant-inventory/schemas/inventory.schema';
import { Product, ProductSchema } from '../../products/schemas/product.schema';
import { Transaction, TransactionSchema } from '../../transactions/schemas/transaction.schema';
import { Recipe, RecipeSchema } from '../../merchant-inventory/schemas/recipe.schema';
import { LogInventory, MerchantLogInventorySchema } from '../../merchant-log/schemas/merchant-log-inventory.schema';
import { Supplier, SupplierSchema } from '../../merchant-supplier/schemas/supplier.schema';
import { MerchantUser, MerchantUserSchema } from '../../merchant-user/schemas/merchant-user.schema';
import { BaseTenantService } from '../../../core/tenant/tenant.service';

@Injectable({ scope: Scope.REQUEST })
export class SourceLibrary extends BaseTenantService {
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
  ) {
    super(connection, request);
  }

  // --- GETTER MODELS ---
  private get inventoryModel() { return this.getModel<Inventory>(Inventory.name, InventorySchema); }
  private get productModel() { return this.getModel<Product>(Product.name, ProductSchema); }
  private get transactionModel() { return this.getModel<Transaction>(Transaction.name, TransactionSchema); }
  private get logInventoryModel() { return this.getModel<LogInventory>(LogInventory.name, MerchantLogInventorySchema); }
  private get recipeModel() { return this.getModel<Recipe>(Recipe.name, RecipeSchema); }
  private get supplierModel() { return this.getModel<Supplier>(Supplier.name, SupplierSchema); }
  private get userModel() { return this.getModel<MerchantUser>(MerchantUser.name, MerchantUserSchema); }

  async gatherContext(oid: Types.ObjectId, question: string) {
    const contextData: any = {};
    const q = question.toLowerCase();

    const intentMap = [
      {
        keys: ['stok', 'habis', 'inventory', 'sisa', 'gudang'],
        action: async () => (contextData.inventory = await this.getLowStockReport(oid)),
      },
      {
        keys: ['jual', 'laku', 'omzet', 'transaksi', 'pendapatan', 'duit'],
        action: async () => (contextData.sales = await this.getSalesSummary(oid)),
      },
      {
        keys: ['resep', 'modal', 'untung', 'profit', 'hpp'],
        action: async () => (contextData.recipeAnalysis = await this.getRecipeProfitability(oid)),
      },
      // --- PENAMBAHAN INTENT BARU ---
      {
        keys: ['mutasi', 'log', 'perubahan stok', 'masuk keluar'],
        action: async () => (contextData.stockMovement = await this.getStockMovementAnalysis(oid)),
      },
      {
        keys: ['supplier', 'pemasok', 'beli barang'],
        action: async () => (contextData.suppliers = await this.getSupplierList(oid)),
      },
      {
        keys: ['pelanggan', 'customer', 'pembeli', 'user'],
        action: async () => (contextData.customerAnalysis = await this.getTopCustomers(oid)),
      }
    ];

    const tasks = intentMap
      .filter((intent) => intent.keys.some((k) => q.includes(k)))
      .map((intent) => intent.action());

    await Promise.all(tasks);
    return contextData;
  }

  // --- DATA AGGREGATORS ---

  private async getLowStockReport(outletId: Types.ObjectId) {
    return await this.inventoryModel.find({
      outlet_id: outletId,
      $expr: { $lte: ['$stock', '$min_stock_alert'] },
      isDeleted: false,
    }).select('name sku stock unit').limit(15).lean();
  }

  private async getSalesSummary(outletId: Types.ObjectId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Mulai dari tanggal 1 bulan ini

    return await this.transactionModel.aggregate([
      { $match: { outlet_id: outletId, status: 'PAID', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total_amount' },
          totalTrx: { $sum: 1 },
          avgBasket: { $avg: '$total_amount' },
          maxTrx: { $max: '$total_amount' }
        },
      },
    ]);
  }

  private async getStockMovementAnalysis(outletId: Types.ObjectId) {
    // Mengambil 20 mutasi stok terakhir untuk melihat tren
    return await this.logInventoryModel.find({ outlet_id: outletId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-createdAt -updatedAt -outlet_id -_id -isDeleted -__v')
      .lean();
  }

  private async getRecipeProfitability(outletId: Types.ObjectId) {
    return await this.productModel.aggregate([
      { $match: { outlet_id: outletId, isDeleted: false, price_buy: { $gt: 0 } } },
      {
        $project: {
          name: 1,
          price_sell: 1,
          price_buy: 1,
          profitMargin: {
            $cond: [
              { $eq: ['$price_sell', 0] }, 0,
              { $multiply: [{ $divide: [{ $subtract: ['$price_sell', '$price_buy'] }, '$price_sell'] }, 100] }
            ]
          }
        },
      },
      { $sort: { profitMargin: -1 } }
    ]).limit(10);
  }

  private async getSupplierList(outletId: Types.ObjectId) {
    return await this.supplierModel.find({ outlet_id: outletId, isDeleted: false })
      .select('name phone category email')
      .limit(10)
      .lean();
  }

  private async getTopCustomers(outletId: Types.ObjectId) {
    return await this.transactionModel.aggregate([
      { $match: { outlet_id: outletId, status: 'PAID', customer_id: { $exists: true } } },
      {
        $group: {
          _id: '$customer_id',
          visitCount: { $sum: 1 },
          totalSpent: { $sum: '$total_amount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);
  }
}