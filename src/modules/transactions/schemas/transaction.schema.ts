/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/modules/transactions/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema( { _id: false, timestamps: true })

class Payment {

  @Prop({ default: 'cash' })
  type!: string; //  ['bank_transfer', 'virtual_account', 'e_wallet', 'qris', 'retail', 'etc','bkc','tvk','edc', 'cash','echannel],

  @Prop({ default: '' })
  pay_id!: string; // 

  @Prop({ default: "" })
  status!: string; // [ 'dp', 'pending', 'paid' ]

  @Prop({ default: false })
  code!: string; // 

  @Prop({ required: true })
  label!: string; // A, B, C, D, atau E

  @Prop({ default: 0 })
  due_price!: number; // Sisa tagihan (jika partial)

  @Prop({ default: 0 })
  price!: number;  // Nominal yang dibayarkan

  @Prop({ default: 0 })
  change!: number; // Kembalian

  @Prop({ default: '' })
  note!: string; // 

  @Prop({ default: '' })
  user_sent!: string; // 

  @Prop({ default: '' })
  bill_key!: string; // 

  @Prop({ default: '' })
  biller_code!: string; // 

  @Prop({ default: '' })
  merchant_id!: string; // 

  @Prop({ default: '' })
  account_number!: string; // 

  @Prop({ default: '' })
  provider_name!: string; // BCA, Mandiri, BNI, BRI

  @Prop({ default: 'IDR' })
  currency!: string; // 

}

const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema({ _id: false })
class Discount {
  @Prop({ type: Types.ObjectId, ref: 'Promo', required: false })
  promo_id!: Types.ObjectId; // Saran: ganti nama ke promo_id agar tidak tertukar dengan label 'type'

  @Prop({ default: 'fixed' }) // 'percentage' atau 'fixed'
  discount_type!: string; 

  @Prop({ default: 0 })
  nominal!: number; 
}

// BUAT SCHEMA UNTUK DISCOUNT JUGA
const DiscountSchema = SchemaFactory.createForClass(Discount);


// --- 3. Main Schema Transaction ---
@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true, unique: true })
  trx_id!: string; // Contoh: INV/2023/0001

  @Prop({ type: Types.ObjectId, ref: 'outlets', required: true })
  outlet_id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: 'Customer', })
  customer_key!: Types.ObjectId; // Bisa optional atau link ke CustomerId

  @Prop({ type: Types.ObjectId,required: true, ref: 'MerchantUser', })
  cashier_key!: Types.ObjectId;  // Bisa optional atau link ke CustomerId
  

  @Prop({
    type: [{
      product_id: { type: Types.ObjectId, ref: 'Product' },
      name: { type: String }, // Snapshot nama
      price: { type: Number }, // Snapshot harga jual
      discount_item: { type: Number, default: 0 },
      qty: { type: Number },
      subtotal: { type: Number }
    }]
  })

  product_key!: any[];

  @Prop({ default: 0 })
  down_payment!: number;

  @Prop({ default: 0 })
  sub_amount!: number;

  @Prop({ default: 0 })
  total_amount!: number;

  @Prop({ type: DiscountSchema, default: () => ({}) })
  discount!: Discount;

  @Prop({ default: 0 })
  tax_amount!: number;

  @Prop({ default: 0 })
  shippingFee!: number;

  @Prop({ default: '' })
  note!: string;

  @Prop({ default: '' })
  syncStatus!: string;   // synced | pending | failed ( S | P | F })

  @Prop({ type: [PaymentSchema] })
  payments!: Payment[];

  @Prop({ type: String, enum: ['PAID', 'CANCELLED', 'REFUND', 'PARTIAL','PENDING'], default: 'PAID' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // Siapa kasirnya
  created_by!: Types.ObjectId;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);