// src/modules/auth/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  full_name!: string;

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ 
    type: String, 
    enum: ['OWNER', 'MANAGER', 'CASHIER'], 
    default: 'CASHIER' 
  })
  
  role!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Outlet' })
  accessible_outlets!: Types.ObjectId[]; // Kasir A mungkin hanya bisa buka Outlet A

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);