// src/modules/auth/schemas/merchant-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class MerchantUser extends Document {
  @Prop({ required: true, trim: true })
  full_name!: string;

  @Prop({ required: true, unique: true, trim: true })
  username!: string; // Kasir biasanya login pakai username agar cepat

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ type: MediaObjectSchema })
  avatar!: MediaObject;

  @Prop({ 
    type: String, 
    enum: ['OWNER', 'MANAGER', 'CASHIER'], 
    default: 'CASHIER' 
  })
  role!: string;

  // Penting: Membatasi kasir hanya bisa akses outlet tertentu
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Outlet' }], default: [] })
  accessible_outlets!: Types.ObjectId[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  last_login!: Date;
}

export const MerchantUserSchema = SchemaFactory.createForClass(MerchantUser);