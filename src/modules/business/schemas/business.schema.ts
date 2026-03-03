// src/modules/business/schemas/business.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';

@Schema({ timestamps: true })
export class Business extends Document {
  @Prop({ required: true })
  name!: string; // Nama Perusahaan

  @Prop({ required: true, unique: true })
  email!: string; // Email owner bisnis

  @Prop({ required: true, unique: true })
  tenant_id!: string; // Identifier unik untuk nama database (misal: "kopi_maju_db")

  @Prop({ type: MediaObjectSchema })
  logo!: MediaObject;

  @Prop()
  owner_name!: string;

  @Prop()
  phone!: string;

  @Prop({ default: 'TRIAL', enum: ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'] })
  subscription_plan!: string;

  @Prop()
  expired_at!: Date;

  @Prop({ default: true })
  isActive!: boolean;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);