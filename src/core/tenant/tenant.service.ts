/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { Connection, Model, Schema } from 'mongoose';

export abstract class BaseTenantService {
  constructor(protected readonly connection: Connection) {}

  /**
   * Fungsi helper untuk mendapatkan model secara dinamis 
   * sekaligus mendaftarkan schema pendukung (untuk populate)
   */
  protected getModel<T>(modelName: string, schema: any, relatedSchemas?: { name: string, schema: any }[]): Model<T> {
    if (!this.connection) {
      throw new Error('Database connection for tenant not found');
    }

    // 1. Daftarkan skema pendukung (untuk kebutuhan populate) jika ada
    if (relatedSchemas) {
      relatedSchemas.forEach(item => {
        if (!this.connection.models[item.name]) {
          this.connection.model(item.name, item.schema);
        }
      });
    }

    // 2. Ambil atau buat model utama
    return this.connection.model<T>(modelName, schema);
  }
}