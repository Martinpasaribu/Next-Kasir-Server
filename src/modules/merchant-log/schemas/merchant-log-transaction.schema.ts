// src/modules/merchant-log/schemas/merchant-journal.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'log_transactions' })
export class LogTransaction extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  outlet_id!: Types.ObjectId;

  // Domain asal: 'TRX', 'PRODUCT'
  @Prop({ required: true, index: true })
  domain!: string; 

  // Jenis mutasi: 'SALE', 'REFUND', 'DISCOUNT','CHANCEL','UPDATE'
  @Prop({ required: true, index: true })
  action_type!: string;

  // Link ke entitas terkait (OrderID)
  @Prop({ type: Types.ObjectId, required: false, index: true })
  reference_id!: Types.ObjectId;

  @Prop({ default: 0 })
  quantity!: number; // Jumlah barang yang bergerak

  @Prop({ default: 0 })
  total_value!: number; // quantity * unit_price

  @Prop({ type: Object })
  metadata!: Record<string, any>; 

  @Prop()
  note!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performed_by!: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
  
}

export const MerchantLogTransactionSchema = SchemaFactory.createForClass(LogTransaction);