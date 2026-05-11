/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { Connection, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Business } from '@/modules/business/schemas/business.schema';

@Injectable()
export class TenantValidationService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<Business>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Validasi status bisnis dan ambil tenant_id asli dari Master DB
   */
  async validateTenantStatus(slug: string): Promise<{ status: boolean; tenantId?: string }> {
    // 1. Gabungkan slug dengan domain utama
    const fullDomain = `${slug}.nextkasir.com`;

    // 2. Cari di Master DB
    const business = await this.businessModel.findOne({ tenant_domain: fullDomain });

    // 3. Cek keberadaan dan status aktif
    if (!business || !business.isActive) {
      return { status: false };
    }

    // 4. Cek masa berlaku (Expired)
    if (business.expired_at && new Date() > new Date(business.expired_at)) {
      return { status: false };
    }

    // 5. Kembalikan objek sukses beserta tenant_id asli untuk koneksi DB
    return {
      status: true,
      tenantId: business.tenant_id // Ini adalah ID yang ada 'tenant_'-nya
    };
  }
}