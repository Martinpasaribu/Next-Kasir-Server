/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/merchant-supplier/merchant-supplier.service.ts

import { Injectable, Inject, Scope, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection, Types } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';

// Schemas
import { Supplier, SupplierSchema } from './schemas/supplier.schema';

@Injectable({ scope: Scope.REQUEST })
export class MerchantSupplierService extends BaseTenantService {
  private readonly logger = new Logger(MerchantSupplierService.name);

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
  ) {
    super(connection, request);
  }

  /**
   * Getter untuk Model Supplier (Multi-tenant aware)
   */
  private get supplierModel() {
    return this.getModel<Supplier>(Supplier.name, SupplierSchema);
  }

  /**
   * Membuat Supplier Baru
   */
  async create(data: Partial<Supplier>) {
    const oId = this.currentOutletId; // Pastikan merchant_id terisi otomatis
        
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

    const newSupplier = new this.supplierModel({
      ...data,
      outlet_id: new Types.ObjectId(oId),
    });

    return await newSupplier.save();
  }
  /**
   * Mengambil semua supplier milik merchant
   */
  async findAll(query: any = {}) {

    const oId = this.currentOutletId; // Pastikan merchant_id terisi otomatis
        
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');


    const supplier =  await this.supplierModel
      .find({ outlet_id: new Types.ObjectId(oId), ...query })
      .sort({ name: 1 })
      .exec();

    return {
      status: true,
      message: `Daftar supplier berhasil diambil ${this.currentOutletId}`,
      data: supplier,
    };
  }

  /**
   * Detail Supplier
   */
  async findOne(id: string) {

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Format ID Supplier tidak valid');
    }

    const oId = this.currentOutletId; // Pastikan merchant_id terisi otomatis
        
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');


    const supplier = await this.supplierModel
      .findOne({ _id: new Types.ObjectId(id), outlet_id:new Types.ObjectId(oId) })
      .exec();

    if (!supplier) {
      throw new NotFoundException(`Supplier dengan ID ${id} tidak ditemukan`);
    }
    return supplier;
  }

  async findAllOptions() {
    return await this.supplierModel
      .find({ 
        ...this.outletFilter, 
        isActive: true 
      })
      .select('_id name') 
      .sort({ name: 1 }) 
      .exec();
  }

  /**
   * Update Data Supplier
   */
  async update(id: string, updateData: Partial<Supplier>) {
    
    const oId = this.currentOutletId; // Pastikan merchant_id terisi otomatis
        
    if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

    const updated = await this.supplierModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), outlet_id: new Types.ObjectId(oId) },
        { $set: updateData },
        { new: true }
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Gagal update, Supplier tidak ditemukan`);
    }
    return updated;
  }

  /**
   * Non-aktifkan Supplier (Soft Delete style)
   */
  async remove(id: string) {
    return await this.update(id, { is_active: false } as any);
  }

  /**
   * Dashboard Helper: Mendapatkan Supplier yang sering digunakan
   * (Bisa diintegrasikan dengan InventoryLog nantinya)
   */
  async getFrequentlyUsed() {
    // Logic tambahan jika ingin melihat statistik pembelian
  }
}