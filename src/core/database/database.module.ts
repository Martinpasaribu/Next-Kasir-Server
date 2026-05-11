/* eslint-disable max-len */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// // src/core/database/database.module.ts

// import { Global, Module, Scope, UnauthorizedException } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { REQUEST } from '@nestjs/core';
// import { Connection, createConnection } from 'mongoose';
// import { ConfigService } from '@nestjs/config';
// import { TenantValidationService } from '../tenant/tenant.validation'; 
// import { BusinessModule } from '@/modules/business/business.module';
// import { Business, BusinessSchema } from '@/modules/business/schemas/business.schema';

// @Global()
// @Module({
//   imports: [
//     // 1. Koneksi ke Master Database
//     MongooseModule.forRootAsync({
//       useFactory: (config: ConfigService) => ({
//         uri: config.get<string>('MASTER_DB_URI'),
//       }),
//       inject: [ConfigService],
//     }),
//     // Daftarkan Business Schema untuk keperluan validasi
//     MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
//     BusinessModule,
//   ],
//   providers: [
//     TenantValidationService,
//     {
//       provide: 'TENANT_CONNECTION',
//       scope: Scope.REQUEST,
//       inject: [REQUEST, ConfigService, TenantValidationService],
//       useFactory: async (
//         request: any, 
//         config: ConfigService, 
//         tenantValidationService: TenantValidationService
//       ) => {
//         // Ambil input mentah (Bisa "nagatama.nextkasir.com" atau "nagatama")
//         const rawTenantId = request.headers['x-tenant-id'] || request.query['tenantId'];

//         // Perbaikan: Pastikan nama variabel konsisten (rawTenantId)
//         if (!rawTenantId || typeof rawTenantId !== 'string') {
//           return null; 
//         }

//         /**
//          * 1. SANITASI INPUT
//          * Memotong domain (.nextkasir.com) jika dikirim oleh Frontend
//          */
//         const slug = rawTenantId.split('.')[0];

//         /**
//          * 2. VALIDASI & MAPPING ID
//          * Mencari data di Master DB dan mengambil tenant_id asli (tanpa titik)
//          */
//         const validation = await tenantValidationService.validateTenantStatus(slug);

//         if (!validation.status || !validation.tenantId) {
//           throw new UnauthorizedException(`Tenant '${slug}' tidak aktif atau tidak ditemukan.`);
//         }

//         const baseUri = config.get<string>('TENANT_DB_BASE_URI');
        
//         /**
//          * 3. KONEKSI DINAMIS
//          * Menggunakan tenantId hasil validasi (contoh: tenant_nagatama_a123)
//          */
//         const tenantConnectionUri = `${baseUri}/${validation.tenantId}?retryWrites=true&w=majority`;

//         try {
//           const connection = await createConnection(tenantConnectionUri).asPromise();
//           console.log(`[Multi-Tenant] 🚀 Connected to DB: ${validation.tenantId}`);
//           return connection;
//         } catch (error : any) {
//           console.error(`[Multi-Tenant] ❌ Gagal konek ke: ${validation.tenantId}`, error.message);
//           throw error;
//         }
//       },
//     },
//   ],
//   exports: ['TENANT_CONNECTION', TenantValidationService],
// })
// export class DatabaseModule {}