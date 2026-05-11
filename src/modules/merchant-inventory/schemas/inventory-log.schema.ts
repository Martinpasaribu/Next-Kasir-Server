/* eslint-disable max-len */
// src/modules/merchant-inventory/schemas/inventory-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InventoryLog extends Document {

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outlet_id!: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['SALE', 'RESTOCK', 'ADJUSTMENT','ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'WASTE', 'RECIPE_CONSUMPTION'] 
  })
  type!: string;

  @Prop({ required: true })
  quantity!: number; // Negatif jika barang keluar, Positif jika barang masuk

  @Prop({ required: true })
  cost_at_time!: number; // Harga modal saat kejadian (Kunci akurasi laporan HPP)

  @Prop({ type: Types.ObjectId, ref: 'Order', required: false })
  reference_id!: Types.ObjectId; // Link ke ID Transaksi (jika tipenya SALE/RECIPE)

  @Prop()
  note!: string; // Keterangan tambahan (misal: "Barang rusak/expired")
}

export const InventoryLogSchema = SchemaFactory.createForClass(InventoryLog);