/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
// core/tenant/tenant.module.ts
import { Module, Scope, Global } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Global() // Agar bisa dipakai di semua modul (categories, products, dll)
@Module({
  providers: [
    {
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST, // 👈 SANGAT PENTING
      inject: [REQUEST, getConnectionToken()],
      useFactory: async (request: any, connection: Connection) => {
        // Ambil tenant ID dari header. Contoh: 'x-tenant-id'
        const tenantId = request.headers['x-tenant-id'] || request.query['tenantId'];

        if (!tenantId) {
          // Inilah yang menyebabkan error di CategoriesService Anda
          return null; 
        }

        // Logika switching database Mongoose
        // Jika database utama Anda namanya 'main', ini akan switch ke 'tenant_id_database'
        return connection.useDb(`tenant_${tenantId}`, { useCache: true });
      },
    },
  ],
  exports: ['TENANT_CONNECTION'],
})
export class TenantModule {}