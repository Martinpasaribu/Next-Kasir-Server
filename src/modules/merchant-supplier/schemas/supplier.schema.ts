// src/modules/merchant-supplier/schemas/supplier.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Supplier extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outlet_id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  contact_person!: string;

  @Prop()
  phone!: string;

  @Prop()
  email!: string;

  @Prop()
  address!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
    
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);