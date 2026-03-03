// src/modules/auth/schemas/admin-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class AdminUser extends Document {
  @Prop({ required: true, trim: true })
  full_name!: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ required: true, select: false }) // Aman: tidak akan muncul saat query biasa
  password!: string;

  @Prop({ type: MediaObjectSchema })
  avatar!: MediaObject;

  @Prop({ 
    type: String, 
    enum: ['SUPERADMIN', 'ADMIN', 'CO_ADMIN'], 
    default: 'ADMIN' 
  })
  role!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: null })
  last_login!: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);