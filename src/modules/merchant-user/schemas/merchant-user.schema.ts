// src/modules/auth/schemas/merchant-user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaObject, MediaObjectSchema } from '../../media/schema/media.schema';

@Schema({ 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true },
  collection: 'users' // <-- Tambahkan ini untuk nama kustom
})
export class MerchantUser extends Document {
  @Prop({ required: true, trim: true })
  full_name!: string;

  @Prop({ required: true, unique: true, trim: true })
  username!: string; // Kasir biasanya login pakai username agar cepat
  
  @Prop({ required: true, unique: true, trim: true })
  email!: string; // Kasir biasanya login pakai username agar cepat

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ type: MediaObjectSchema })
  avatar!: MediaObject;

  @Prop({ 
    type: String, 
    enum: ['OWNER', 'MANAGER','ASSISTANT','CASHIER'], 
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

  @Prop({ default: 0 })
  isLiveDuration!: number;

  @Prop({ default: null })
  refresh_token!: number;

  @Prop({
    type: {
      show_shift: { type: Boolean, default: false },
      show_product: { type: Boolean, default: false },
      show_ingredient: { type: Boolean, default: false },
      show_table: { type: Boolean, default: false },
      show_promo: { type: Boolean, default: false },
      show_inventory: { type: Boolean, default: false },
      show_employee: { type: Boolean, default: false },
      show_customer: { type: Boolean, default: false },
      show_debt: { type: Boolean, default: false },
      show_purchase: { type: Boolean, default: false },
      show_cash: { type: Boolean, default: false },
      show_setting: { type: Boolean, default: false },
      show_report_transaction: { type: Boolean, default: false },
      show_report_ewallet: { type: Boolean, default: false },
      show_report_income: { type: Boolean, default: false },
      show_report_cash: { type: Boolean, default: false },
      show_report_sale: { type: Boolean, default: false },
      show_report_shift: { type: Boolean, default: false },
      show_report_profit_loss: { type: Boolean, default: false },
      show_help: { type: Boolean, default: true },
      show_about: { type: Boolean, default: true },
    },
    default: {}
  })
  permissions!: Record<string, boolean>;
  
}

export const MerchantUserSchema = SchemaFactory.createForClass(MerchantUser);