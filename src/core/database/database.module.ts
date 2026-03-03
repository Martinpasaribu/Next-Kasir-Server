/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/core/database/database.module.ts

import { Global, Module, Scope } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { REQUEST } from '@nestjs/core';
import { Connection, createConnection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    // 1. Koneksi ke Master Database (Daftar Bisnis)
    // Mengambil MASTER_DB_URI dari .env
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MASTER_DB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      /* 2. Dynamic Connection Provider
         Menggunakan Scope.REQUEST agar koneksi dibuat ulang 
         setiap kali ada request dengan tenant_id yang berbeda.
      */
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST,
      useFactory: async (request: any, config: ConfigService) => {
        const tenantId = request.headers['x-tenant-id'];

        // Jika tidak ada header tenant, kita tidak bisa membuat koneksi dinamis
        if (!tenantId) {
          return null; 
        }

        // Ambil base URI Atlas dari .env (tanpa nama database di ujungnya)
        const baseUri = config.get<string>('TENANT_DB_BASE_URI');
        
        // Gabungkan Base URI + Nama Database Tenant + Options Atlas
        // Hasilnya: mongodb+srv://user:pw@cluster.net/nama_tenant?retryWrites=true...
        const tenantConnectionUri = `${baseUri}/${tenantId}?retryWrites=true&w=majority`;

        try {
          // Membuat koneksi ke database tenant secara on-the-fly
          const connection = await createConnection(tenantConnectionUri).asPromise();
          return connection;
        } catch (error) {
          console.error(`Gagal mengoneksikan ke database tenant: ${tenantId}`, error);
          throw error;
        }
      },
      inject: [REQUEST, ConfigService],
    },
  ],
  exports: ['TENANT_CONNECTION'],
})
export class DatabaseModule {}