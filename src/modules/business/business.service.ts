/* eslint-disable max-len */
// src/modules/business/business.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schemas/business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    // Berbeda dengan modul lain, ini menggunakan InjectModel standar 
    // karena Business selalu ada di Master Database
    @InjectModel(Business.name) private businessModel: Model<Business>,
  ) {}

  /**
   * Mendaftarkan bisnis baru ke sistem (SaaS Onboarding)
   */
  async registerNewBusiness(dto: CreateBusinessDto): Promise<Business> {
    const { tenant_id, email } = dto;

    // 1. Validasi duplikasi tenant_id atau email
    const existing = await this.businessModel.findOne({
      $or: [{ tenant_id }, { email }],
    });

    if (existing) {
      throw new ConflictException('Tenant ID atau Email sudah terdaftar');
    }

    // 2. Simpan data bisnis ke Master DB
    const newBusiness = new this.businessModel(dto);
    return await newBusiness.save();
  }

  /**
   * Mengambil data profil bisnis untuk kebutuhan Header/Struk
   */
  async getBusinessProfile(tenantId: string): Promise<Business> {
    const business = await this.businessModel.findOne({ 
      tenant_id: tenantId, 
      isActive: true 
    });

    if (!business) {
      throw new NotFoundException(`Bisnis dengan Tenant ID ${tenantId} tidak ditemukan atau tidak aktif`);
    }
    return business;
  }

  /**
   * Update informasi bisnis (Ganti logo, nama, atau alamat pusat)
   */
  async updateBusiness(tenantId: string, updateDto: UpdateBusinessDto): Promise<Business> {
    const updated = await this.businessModel.findOneAndUpdate(
      { tenant_id: tenantId },
      { $set: updateDto },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Gagal memperbarui, Bisnis tidak ditemukan');
    }
    return updated;
  }

  /**
   * Helper untuk Middleware: Mengecek apakah database tenant boleh diakses
   */
  async validateTenantStatus(tenantId: string): Promise<boolean> {
    const business = await this.businessModel.findOne({ tenant_id: tenantId });
    
    if (!business || !business.isActive) return false;
    
    // Cek apakah masa berlangganan masih berlaku
    if (business.expired_at && new Date() > business.expired_at) {
      return false;
    }

    return true;
  }
}