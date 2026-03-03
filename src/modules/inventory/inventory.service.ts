/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/modules/inventory/inventory.service.ts

import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { StockLog, StockLogSchema } from './schemas/stock-log.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { CreateStockLogDto } from './dto/create-stock-log.dto';
import { BaseTenantService } from 'src/core/tenant/tenant.service';

@Injectable()
export class InventoryService extends BaseTenantService {

  constructor(@Inject('TENANT_CONNECTION') connection: Connection) {
    // ✅ Teruskan koneksi ke parent (BaseTenantService)
    super(connection);
  }

  private get stockLogModel() {
    return this.getModel<StockLog>(StockLog.name, StockLogSchema);
  }

  private get productModel() {
    return this.getModel<Product>(Product.name, ProductSchema);
  } 


  /**
   * Update Stok & Catat Log (Audit Trail)
   */
  async updateStock(dto: CreateStockLogDto, userId: string) {
    const { product_id, outlet_id, amount, type, reason } = dto;

    // 1. Cari produknya dulu
    const product = await this.productModel.findById(product_id);
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    const previousStock = product.stock || 0;
    let newStock = previousStock;

    // 2. Hitung stok baru berdasarkan tipe
    if (type === 'IN' || type === 'RETURN') {
      newStock += amount;
    } else if (type === 'OUT' || type === 'SALE' || type === 'EXPIRED') {
      newStock -= amount;
    } else if (type === 'ADJUSTMENT') {
      newStock = amount; // Jika Adjustment, amount adalah nilai stok akhir yang benar
    }

    if (newStock < 0) {
      throw new BadRequestException('Stok tidak mencukupi untuk transaksi ini');
    }

    // 3. Update koleksi Product
    product.stock = newStock;
    await product.save();

    // 4. Catat ke StockLog
    const log = new this.stockLogModel({
      product_id: new Types.ObjectId(product_id),
      outlet_id: new Types.ObjectId(outlet_id),
      type,
      amount,
      previous_stock: previousStock,
      current_stock: newStock,
      reason,
      created_by: new Types.ObjectId(userId),
    });

    return await log.save();
  }

  async getStockHistory(productId: string, outletId: string) {
    return await this.stockLogModel
      .find({ product_id: productId, outlet_id: outletId })
      .populate('created_by', 'full_name')
      .sort({ createdAt: -1 })
      .exec();
  }
}