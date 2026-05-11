// import { Inject, Injectable, Scope } from '@nestjs/common';
// import { REQUEST } from '@nestjs/core';
// import { Connection, Model, Schema } from 'mongoose';
// import { Request } from 'express';

// @Injectable({ scope: Scope.REQUEST })
// export class TenantBaseService {
//   constructor(
//     @Inject('TENANT_CONNECTION') protected readonly connection: Connection,
//     @Inject(REQUEST) protected readonly request: Request,
//   ) {}

//   /**
//    * Mengambil Model secara dinamis sekaligus mendaftarkan skema jika belum ada
//    */
//   protected getModel<T>(name: string, schema: Schema): Model<T> {
//     return this.connection.models[name] || this.connection.model(name, schema);
//   }

//   /**
//    * Mengambil Outlet ID dari Header yang dikirim oleh Nuxt Nitro
//    */
//   protected get currentOutletId(): string | null {
//     const outletId = this.request.headers['x-outlet-id'];
//     return outletId ? (outletId as string) : null;
//   }

//   /**
//    * Helper untuk filter default (Isolasi Data)
//    * Contoh penggunaan: this.model.find({ ...this.baseFilter })
//    */
//   protected get baseFilter() {
//     return {
//       outlet_id: this.currentOutletId,
//       isDeleted: false,
//     };
//   }
// }