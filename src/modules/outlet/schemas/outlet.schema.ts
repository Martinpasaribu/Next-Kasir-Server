/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/outlet/schemas/outlet.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { MediaObject, MediaObjectSchema } from 'src/modules/media/schema/media.schema';

@Schema({ 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
})
export class Outlet extends Document {
  @Prop({ required: true, trim: true })
  name!: string; // Contoh: "Kopi Maju - Cabang Sudirman"
  
  @Prop({ required: false, trim: true })
  description!: string; // Contoh: "Kopi Maju - Cabang Sudirman"

  @Prop({ required: true, unique: true })
  code!: string; // Contoh: "KM-001" untuk identitas internal

  @Prop({ required: true })
  address!: string;

  @Prop()
  phone!: string;

  @Prop()
  email!: string;

  @Prop({ type: MediaObjectSchema })
  icon!: MediaObject; // Logo khusus per outlet (jika ada)

  // Koordinat lokasi untuk integrasi maps atau pencarian outlet terdekat
  @Prop({
    type: {
      lat: { type: Number },
      lng: { type: Number },
      link: { type: String },
    },
    required: false
  })

  location!: { lat: number; lng: number, link?: string} | null;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: 0 })
  order!: number;
}

export const OutletSchema = SchemaFactory.createForClass(Outlet);

// --- VIRTUAL FIELDS ---

// Menghitung jumlah transaksi di outlet ini
OutletSchema.virtual('totalTransactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'outlet_id',
  count: true
});

// Menghitung jumlah staff/user yang ditugaskan di outlet ini
OutletSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'accessible_outlets',
  count: true
});