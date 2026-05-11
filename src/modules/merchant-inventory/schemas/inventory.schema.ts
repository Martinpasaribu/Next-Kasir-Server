// src/modules/merchant-inventory/schemas/inventory.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';


@Schema({ timestamps: true })
export class Inventory extends Document {

  @Prop({ required: true, unique: true }) // SKU atau Barcode
  sku!: string;

  @Prop({ required: true, unique: true }) // SKU atau Barcode
  name!: string;

  @Prop({ type: String,  default: 'pcs' })
  unit!: string;

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outlet_id!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Supplier' }], default: [] })
  supplier_id!: Types.ObjectId[];

  @Prop({ default: 5 })
  min_stock_alert!: number; // Notifikasi jika stok menipis

  @Prop({ default: 0 })
  stock!: number;

  @Prop({ default: 0 })
  average_cost!: number; // Harga modal rata-rata (HPP) untuk perhitungan profit

  @Prop({ type: MediaObjectSchema })
  image!: MediaObject;

  @Prop({ default: true })
  isActive!: boolean;
  
  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);