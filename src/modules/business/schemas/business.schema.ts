// src/modules/business/schemas/business.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Business extends Document {
  @Prop({ required: true })
  name!: string; 

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string; 

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  tenant_id!: string; // Identifier: "mobil-berkah", "kopi-maju"
  
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  tenant_suffix!: string; // Identifier: "mobil-berkah", "kopi-maju"
  
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  tenant_domain!: string; // Identifier: "mobil-berkah", "kopi-maju"

  // --- FIELD TAMBAHAN YANG DISARANKAN ---

  @Prop({ select: false }) 
  initial_password!: string; // Password pertama untuk Owner login di POS/CMS

  @Prop()
  address!: string; // Alamat pusat bisnis

  @Prop({ default: 'IDR' })
  currency!: string; // Untuk format harga di POS (IDR, USD, dll)

  @Prop({ default: 0 })
  timezone_offset!: number; // Untuk sinkronisasi waktu laporan (WIB = 7)

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>; // Untuk setting custom di masa depan

  @Prop({ type: MediaObjectSchema })
  logo!: MediaObject;

  @Prop()
  owner_name!: string;

  @Prop()
  business_type!: string;

  @Prop()
  phone!: number;

  @Prop({ default: 'TRIAL', enum: ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'] })
  subscription_plan!: string;

  @Prop()
  expired_at!: Date;

  @Prop({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;

  // Track kapan database tenant dibuat
  @Prop({ default: false })
  isProvisioned!: boolean; 
}

export const BusinessSchema = SchemaFactory.createForClass(Business);