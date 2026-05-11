/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
// core/tenant/tenant.module.ts
import { Module, Scope, Global, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request } from 'express';
import { BusinessModule } from '../../modules/business/business.module'; 
import { TenantValidationService } from './tenant.validation';
import { BusinessService } from '../../modules/business/business.service';
import { Business, BusinessSchema } from '@/modules/business/schemas/business.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
    BusinessModule
  ], 
  providers: [
    TenantValidationService, 
    {
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST, // Memastikan data antar toko tidak tertukar saat diakses bersamaan.
      inject: [
        REQUEST, 
        getConnectionToken(), 
        BusinessService, 
        TenantValidationService 
      ], 
      useFactory: async (
        request: Request, 
        connection: Connection, 
        businessService: BusinessService, 
        tenantValidationService: TenantValidationService
      ) => {
        // 1. Ambil ID mentah (bisa "gerry_shop" atau "gerry_shop.nextkasir.com")
        const rawInput = request.headers['x-tenant-id'] || request.query['tenantId'];

        if (!rawInput) return null;

        // 2. Ambil slug-nya saja (sebelum titik)
        const slug = (rawInput as string).split('.')[0];

        // 3. Panggil Service (Sekarang mendapatkan objek { status, tenantId })
        const validation = await tenantValidationService.validateTenantStatus(slug);
        
        // 4. Jika validasi gagal atau tenantId tidak ditemukan di Master DB
        if (!validation.status || !validation.tenantId) {
          throw new UnauthorizedException(
            `Akses ditolak. Bisnis '${slug}' tidak aktif atau tidak ditemukan.`
          );
        }

        /** * 5. Switch Database
         * Kita gunakan validation.tenantId karena ini adalah ID asli dari DB Master
         * Contoh isinya: "tenant_gerry_shop_8k12j"
         */
        
      const finalDbName = validation.tenantId.replace(/\./g, '_');

        try {
          // Switch database menggunakan ID asli (misal: tenant_gerry_shop_a123) Pindah database dalam 1 koneksi
          console.log(`[Multi-Tenant] 🚀 Connected to DB: ${validation.tenantId}`);
          return connection.useDb(finalDbName, { useCache: true });
          
        } catch (err) {
          console.error('CRITICAL: Gagal switch database', err);
          throw new InternalServerErrorException('Database Connection Error');
        }
      }
    }
  ],
  exports: ['TENANT_CONNECTION', TenantValidationService],
})
export class TenantModule {}