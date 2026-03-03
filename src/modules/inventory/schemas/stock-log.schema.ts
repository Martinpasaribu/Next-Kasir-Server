// src/modules/inventory/schemas/stock-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { ApiProperty } from '@nestjs/swagger';

@Schema({ 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
})
export class StockLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'outlets', required: true })
  outlet_id!: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN', 'EXPIRED'],
    description: 'Tipe pergerakan stok'
  })
  type!: string;

  @Prop({ required: true })
  amount!: number; // Jumlah barang (bisa positif atau negatif)

  @Prop({ required: true })
  previous_stock!: number; // Stok sebelum perubahan

  @Prop({ required: true })
  current_stock!: number; // Stok setelah perubahan

  @Prop({ trim: true })
  reason!: string; // Contoh: "Penjualan INV/001" atau "Barang Rusak di Rak"

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  created_by!: Types.ObjectId; // Siapa yang melakukan perubahan (Kasir/Admin)

  @Prop({ type: String })
  reference_id!: string; // ID transaksi atau ID dokumen pendukung lainnya
}

export const StockLogSchema = SchemaFactory.createForClass(StockLog);

// Indexing agar query laporan stok cepat meskipun data sudah jutaan
StockLogSchema.index({ product_id: 1, outlet_id: 1, createdAt: -1 });