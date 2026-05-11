/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { Connection, Model, Schema, Types } from 'mongoose';
import { Request } from 'express';

export abstract class BaseTenantService {
  constructor(
    protected readonly connection: Connection,
    protected readonly request?: Request
  ){}


  /**
   * Helper untuk mendapatkan Outlet ID dari Header
   */
  protected get currentOutletId(): string | null {
    if (!this.request) return null;
    return (this.request.headers['x-outlet-id'] as string) || null;
  }

  /**
   * Helper untuk mendapatkan Outlet ID dari Header
   */
  protected get currentTenantId(): string | null {
    if (!this.request) return null;
    return (this.request.headers['x-tenant-id'] as string) || null;
  }


  /**
   * Helper Filter Otomatis: Outlet + Not Deleted
   * Gunakan ini di find(), findOne(), dll.
   */

  protected get outletFilter() {
      const outletId = this.currentOutletId;

      // 1. Jika outletId tidak ada (Header kosong)
      if (!outletId) {
        return {
          outlet_id: null,
          isDeleted: false,
          _id: { $exists: false }
        };
      }

      // 2. Validasi format ObjectId sebelum dipakai query
      // Jika format string di header bukan format MongoDB ID yang valid
      if (!Types.ObjectId.isValid(outletId)) {
        return {
          _id: { $exists: false } // Kembalikan filter mustahil jika ID sampah/ngawur
        };
      }

      // 3. Kembalikan filter dengan format ObjectId yang benar
      return {
        outlet_id: new Types.ObjectId(outletId), // Konversi manual ke ObjectId
        isDeleted: false
      };
    }

  /**
   * Fungsi helper untuk mendapatkan model secara dinamis 
   * sekaligus mendaftarkan schema pendukung (untuk populate)
   */
  protected getModel<T>(modelName: string, schema: any, relatedSchemas?: { name: string, schema: any }[]): Model<T> {
    if (!this.connection) {
      throw new Error(`Database connection for tenant ${this.connection} not found`);
    }

    if (relatedSchemas) {
      relatedSchemas.forEach(item => {
        if (!this.connection.models[item.name]) {
          this.connection.model(item.name, item.schema);
        }
      });
    }

    return this.connection.models[modelName] || this.connection.model<T>(modelName, schema);
  }
}