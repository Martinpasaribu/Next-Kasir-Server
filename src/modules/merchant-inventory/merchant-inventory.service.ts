/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable function-paren-newline */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, Scope, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection, Types, ClientSession } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';

// Schemas
import { InventoryLog, InventoryLogSchema } from './schemas/inventory-log.schema';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { generateInventorySku } from '@/common/utils/generator/SKU';
import { MediaObject } from '../media/schema/media.schema';
import { MerchantLogsService } from '../merchant-log/merchant-log.service';
import { Product, ProductSchema } from '../products/schemas/product.schema';

/**
 * Interface untuk parameter update stock agar rapi
 */
interface UpdateStockDto {
  product_id: string;
  outlet_id: Types.ObjectId;
  amount: number;
  type: string;
  reason?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class MerchantInventoryService extends BaseTenantService {
  private readonly logger = new Logger(MerchantInventoryService.name);

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
    private readonly journalService: MerchantLogsService,
  ) {
    super(connection, request);
  }

  /**
   * Getters untuk Models (Multi-tenant aware)
   */
  private get inventoryModel() {
    return this.getModel<Inventory>(Inventory.name, InventorySchema);
  }

  private get logModel() {
    return this.getModel<InventoryLog>(InventoryLog.name, InventoryLogSchema);
  }

  private get recipeModel() {
    return this.getModel<Recipe>(Recipe.name, RecipeSchema);
  }
  private get productModel() {
    return this.getModel<Product>(Recipe.name, ProductSchema);
  }

  async findAllToAdmin() {
    return await this.inventoryModel
      .find(this.outletFilter) 
      .populate('')
      .sort({ order: 1 })
      .exec();
  }

  /**
   * FUNGSI A: Registrasi Inventory (Inisialisasi)
   * Dipanggil saat produk baru dibuat agar muncul di tabel stok outlet
   */
  async registerNewInventory(data: { name: string, sku: string; supplier_id?: string, unit: string, stock: number, image: MediaObject }) {
    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID wajib diisi');

    // 1. Cek duplikasi berdasarkan SKU atau Nama di outlet yang sama
    // Sebaiknya cek SKU juga jika SKU diinput manual dari frontend
    const existing = await this.inventoryModel.findOne({
      ...this.outletFilter, 
      $or: [{ name: data.name }, { sku: data.sku }],
      outlet_id: new Types.ObjectId(oId)
    });

    if (existing) {
      throw new BadRequestException(`Bahan baku dengan nama atau SKU tersebut sudah ada di outlet ini`);
    }

    // 2. Generate SKU jika belum ada (Auto-sku logic)
    let finalSku = data.sku;
    if (!finalSku) {
      finalSku = await generateInventorySku(
        this.inventoryModel, 
        data.name
      );
    }

    // 3. Inisialisasi Model
    const newInv = new this.inventoryModel({
      ...data,
      name: data.name,
      sku: finalSku,
      outlet_id: new Types.ObjectId(oId),
      stock: Number(data.stock) || 0,
      average_cost: 0,
      supplier_id: data.supplier_id ? [new Types.ObjectId(data.supplier_id)] : []
    });

    const saved = await newInv.save();

    // 4. Catat Log (Hanya jika stok awal > 0)
    if (Number(data.stock) > 0) {
      await this.journalService.recordEntryInventory({
        domain: 'INVENTORY',
        action_type: 'ADJUSTMENT',
        reference_id: saved._id,
        quantity: Number(data.stock),
        unit_price: 0, 
        note: 'Inisialisasi stok awal'
      });
    }

    return saved;
  }


  /**
   * FUNGSI B: Tambah Stok Manual (Tanpa Supplier yang Kompleks)
   * Digunakan untuk input stok cepat tanpa hitung moving average yang rumit
   */

  async manualAddStock(
    id: string, // ID langsung dari parameter controller
    data: { quantity: number; cost: number; note?: string }
  ) {
    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID wajib diisi');

    // Siapkan objek update
    const updateQuery: any = {
      $inc: { stock: data.quantity } 
    };

    // Update HPP hanya jika barang masuk (positif)
    if (data.quantity > 0) {
      updateQuery.$set = { average_cost: data.cost };
    }

    const inv = await this.inventoryModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(id), 
        outlet_id: new Types.ObjectId(oId) // Safety check: pastikan milik outlet yg login
      },
      updateQuery,
      { returnDocument: 'after' }
    );

    if (!inv) throw new NotFoundException('Material tidak ditemukan');

  
     
    await this.journalService.recordEntryInventory({
      domain: 'INVENTORY',
      action_type: data.quantity > 0 ? 'RESTOCK' : 'ADJUSTMENT_OUT',
      reference_id: inv._id, 
      quantity: Number(data.quantity),
      unit_price: 0, 
      note: data.note || (data.quantity > 0 ? 'Penambahan manual' : 'Adjustment keluar')
    });

    return inv;
  }

  /**
   * Fungsi Utama: Tambah stok dari Supplier (Restock)
   */

  async restockFromSupplier(
    id: string, // ID langsung dari parameter controller
    data: {
      quantity: number;
      costPerItem: number;
      supplierId: string;
      note?: string;
    },
    session?: any
  ) {

    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');


    const inv = await this.inventoryModel.findOne({
      _id: new Types.ObjectId(id),
      outlet_id: new Types.ObjectId(oId)
    }).session(session).exec();

    if (!inv) throw new NotFoundException('Material tidak ditemukan');

    // Kalkulasi Moving Average Cost
    const currentStock = inv.stock > 0 ? inv.stock : 0;
    const currentHpp = inv.average_cost || 0;
    const totalNewStock = currentStock + data.quantity;
    
    // Rumus: ((Stock Lama * HPP Lama) + (Stock Baru * Harga Baru)) / Total Stok
    const newAverageCost = ((currentStock * currentHpp) + (data.quantity * data.costPerItem)) / totalNewStock;

    inv.stock = totalNewStock;
    inv.average_cost = Math.round(newAverageCost);
    
    if (data.supplierId && !inv.supplier_id.includes(new Types.ObjectId(data.supplierId))) {
      inv.supplier_id.push(new Types.ObjectId(data.supplierId));
    }

    await inv.save({ session });

    // Record Log Inventory
    await this.journalService.recordEntryInventory({
      domain: 'INVENTORY',
      action_type: data.quantity > 0 ? 'RESTOCK' : 'ADJUSTMENT_OUT',
      reference_id: inv._id, 
      quantity: Number(data.quantity),
      unit_price: data.costPerItem,
      metadata: { supplier_id :new Types.ObjectId(data.supplierId)},
      note: data.note || 'Restock dari supplier',
    });

    return inv;
  }



  /**
   * Bonus: Ambil riwayat stok untuk laporan per outlet
   */
  async getStockLogs(filter: any = {}) {
    return await this.logModel
      .find({ ...this.outletFilter, ...filter })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }


  async remove(id: string) {
    const result = await this.inventoryModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: true },
        { isActive: false }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Product ID ${id} tidak ditemukan`);
    }

    return { message: 'Product berhasil dihapus secara soft-delete' };
  }


  async updateStock(data: UpdateStockDto, userId?: string, session?: any) {
    return await this.reduceStockOnCheckout(
      data.product_id,
      data.type,
      data.amount,
      data.reason || 'Transaction Update',
      session
    );
  }

  /**
   * Fungsi Utama: Kurangi stok saat Checkout
   */
  async reduceStockOnCheckout(
    productId: string,
    productType: string,
    quantity: number,
    referenceId: string,
    session?: any
  ) {
    // 1. FAST EXIT: Jasa tidak memiliki stok
    if (productType === 'SVS') return;

    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

    // 2. LOGIC BY TYPE
    switch (productType) {
      case 'FML':
        // Produk yang stoknya bergantung 100% pada resep (BOM)
        return await this.handleCompositeStock(productId, quantity, referenceId, session);

      case 'SPT':
        // Produk jadi/retail - stok ada di koleksi Product
        return await this.executeStockUpdateProduct(productId, quantity, 'SALE', referenceId, session);

      case 'RML':
        // Bahan baku yang bisa dijual langsung - stok ada di koleksi Inventory
        return await this.executeStockUpdateInventory(productId, quantity, 'SALE', referenceId, session);

      default:
        this.logger.warn(`Tipe produk ${productType} tidak dikenal.`);
        return;
    }
  }

  /**
   * Private Helper: Mengelola stok produk berbasis resep (COMPLITE_PRODUCT)
   */
  private async handleCompositeStock(productId: string, qty: number, refId: string, session: any) {
    const recipe = await this.recipeModel
      .findOne({ product_id: new Types.ObjectId(productId) })
      .session(session)
      .select('ingredients')
      .lean()
      .exec();

    if (!recipe || !recipe.ingredients?.length) {
      this.logger.error(`Resep tidak ditemukan untuk produk komposit: ${productId}`);
      return; // Atau throw error jika bisnis mengharuskan resep ada
    }

    // Eksekusi semua bahan baku secara PARALEL (Hemat waktu)
    await Promise.all(
      recipe.ingredients.map((ing) =>
        this.executeStockUpdateInventory(
          ing.material_id.toString(),
          ing.quantity * qty,
          'RECIPE_CONSUMPTION',
          refId,
          session,
        )
      )
    );
  }

  /**
   * Update stok Koleksi PRODUCT (Untuk SPT)
   */
  async executeStockUpdateProduct(productId: string, quantity: number, type: string, referenceId: string, session?: any) {
    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

    const absQty = Math.abs(quantity);

    const updatedProduct = await this.productModel.findOneAndUpdate(
      { _id: new Types.ObjectId(productId), outlet_id: new Types.ObjectId(oId), isDeleted: false },
      { $inc: { stock: -absQty } },
      { session, returnDocument: 'after', select: 'price_buy _id' }
    ).lean().exec();

    if (!updatedProduct) throw new NotFoundException('Produk tidak ditemukan');

    // Logging non-blocking (opsional: tidak perlu await jika tidak butuh data balikan log segera)
    await new this.logModel({
      product_id: updatedProduct._id,
      outlet_id: new Types.ObjectId(oId),
      type,
      quantity: -absQty,
      cost_at_time: updatedProduct.price_buy || 0,
      note: referenceId,
    }).save({ session });

    return updatedProduct;
  }

  /**
   * Update stok Koleksi INVENTORY (Untuk RML & Bahan Baku Resep)
   */
  private async executeStockUpdateInventory(productId: string, quantity: number, type: string, referenceId: string, session?: any) {
    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

    const absQty = Math.abs(quantity);

    const inv = await this.inventoryModel.findOneAndUpdate(
      { product_id: new Types.ObjectId(productId), outlet_id: new Types.ObjectId(oId) },
      { $inc: { stock: -absQty } },
      { session, returnDocument: 'after', select: 'average_cost _id' },
    ).lean().exec();

    if (!inv) {
      this.logger.warn(`Stok inventory tidak ditemukan: Product ${productId}`);
      return;
    }

    await new this.logModel({
      product_id: new Types.ObjectId(productId),
      outlet_id: new Types.ObjectId(oId),
      type,
      quantity: -absQty,
      cost_at_time: inv.average_cost || 0,
      note: referenceId,
    }).save({ session });
  }
  
}