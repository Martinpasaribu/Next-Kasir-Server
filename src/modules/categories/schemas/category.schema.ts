/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/categories/schemas/category.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';

@Schema({ 
  timestamps: true, // Otomatis menambahkan 'createdAt' dan 'updatedAt'
  toJSON: { virtuals: true }, // Agar field virtual muncul saat diubah jadi JSON
  toObject: { virtuals: true } 
})
export class Category extends Document {
  @Prop({ required: true, trim: true })
  @ApiProperty({ example: 'Minuman Dingin' })
  name!: string;

  @Prop({ required: false, unique: true, trim: true })
  @ApiProperty({ example: 'minuman-dingin' })
  slug!: string; // SEO friendly URL atau identifier unik

  @Prop({ required: false, trim: true })
  @ApiProperty({ example: 'DRK' })
  ref_code!: string; // SEO friendly URL atau identifier unik

  @Prop()
  @ApiProperty({ example: 'Kumpulan kategori minuman penyegar' })
  description!: string;

  @Prop()
  @ApiProperty({ example: 'Pilih rasa yang kamu suka' })
  sub_description!: string;

  // Gunakan MediaObjectSchema agar validasi internal Mongoose jalan
  @Prop({ type: MediaObjectSchema })
  icon!: MediaObject;

  @Prop({ type: MediaObjectSchema })
  image_bg!: MediaObject;

  // Untuk array gambar (misal galeri kategori)
  @Prop({ type: [MediaObjectSchema], default: [] })
  images!: MediaObject[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  order!: number; // Untuk urutan tampilan di layar kasir (POS)

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
  
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  recommend!: boolean;
  
  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isFree!: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// --- VIRTUAL FIELD (Penting untuk statistik POS) ---

// Menghitung jumlah produk di dalam kategori ini secara otomatis
CategorySchema.virtual('productCount', {
  ref: 'Product',           // Merujuk ke model Product
  localField: '_id',        // Field di Category ini
  foreignField: 'category_key', // Field di Product yang merujuk ke Category ini
  count: true               // Hanya ambil jumlahnya saja
});

// Jika Anda memiliki Sub-Kategori (opsional)
CategorySchema.virtual('subCategoryCount', {
  ref: 'SubCategory',
  localField: '_id',
  foreignField: 'category_key',
  count: true
});