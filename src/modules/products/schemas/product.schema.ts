// src/modules/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaObject, MediaObjectSchema } from 'src/modules/media/schema/media.schema';

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Product extends Document {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true }) // SKU atau Barcode
  sku!: string;

  @Prop()
  description!: string;

  @Prop()
  sub_description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_key!: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  price_buy!: number; // Harga modal

  @Prop({ required: true, default: 0 })
  price_sell!: number; // Harga jual

  @Prop({ default: 0 })
  stock!: number;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: 5 })
  min_stock_alert!: number; // Notifikasi jika stok menipis

  // Gunakan MediaObjectSchema agar validasi internal Mongoose jalan
  @Prop({ type: MediaObjectSchema })
  icon!: MediaObject;

  @Prop({ type: MediaObjectSchema })
  image_bg!: MediaObject;

  @Prop({ type: [MediaObjectSchema], default: [] })
  images!: MediaObject[];

  @Prop({ type: String, enum: ['pcs', 'kg', 'box', 'liter'], default: 'pcs' })
  unit!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  recommend!: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);