import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true }) // Phone unik sebagai identifier
  phone!: string;

  @Prop()
  address!: string;

  @Prop({ default: 'S' }) // Default 'S' karena jika diinput ke server otomatis sudah synced
  syncStatus!: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);