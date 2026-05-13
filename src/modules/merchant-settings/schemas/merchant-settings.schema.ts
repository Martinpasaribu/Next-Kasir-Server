/* eslint-disable max-len */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Interface untuk Struk (Tetap seperti sebelumnya)
interface ReceiptField {
  value: string;
  status: boolean;
}

interface ReceiptSettings {
  logo: ReceiptField;
  name: ReceiptField;
  address: ReceiptField;
  phone: ReceiptField;
  email: ReceiptField;
  instagram: ReceiptField;
  social_other: ReceiptField;
  website: ReceiptField;
  footer_note: ReceiptField;
  tax_percentage: number; 
  show_time: boolean;
  auto_print: boolean;
  auto_save_print: boolean;
}
interface ReceiptSummarySettings {
  logo: ReceiptField;
  name: ReceiptField;
  address: ReceiptField;
  phone: ReceiptField;
  footer_note: ReceiptField;
  tax_percentage: ReceiptField; 
  header_one: ReceiptField; 
  header_two: ReceiptField; 
  header_three: ReceiptField; 
  show_time: boolean;
  summary_groups: any[];
  auto_print: boolean;
  auto_save_print: boolean;
}

// Tambahan: Interface untuk Pajak Global
interface GlobalTaxSettings {
  tax_name: string;      // Contoh: "PPN" atau "Tax"
  tax_value: number;     // Contoh: 11
  is_enabled: boolean;   
  is_inclusive: boolean; // true: harga sudah termasuk pajak, false: pajak ditambahkan di akhir
}

@Schema({ timestamps: true, collection: 'settings' })
export class Settings extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  outlet_id!: Types.ObjectId;

  @Prop({ required: true, index: true })
  domain!: string; // 'APP', 'ADMIN'

  @Prop({ required: true, index: true })
  name_outlet!: string; 
  
  @Prop({ required: true, index: true })
  address!: string; 

  @Prop({ required: true, index: true })
  description!: string; 
  
  @Prop({ required: true, index: true })
  price_type!: string; // 'RETAIL', 'WHOLESALE', dll

  // --- TAMBAHAN BARU ---
  
  @Prop({ type: String, enum: ['light', 'dark', 'system'], default: 'system' })
  app_theme!: 'light' | 'dark' | 'system';

  @Prop({ type: Object })
  tax_settings!: GlobalTaxSettings;

  // ---------------------

  @Prop({ type: Object })
  settings_receipt!: ReceiptSettings; 

  @Prop({ type: Object })
  settings_receipt_summary!: ReceiptSummarySettings; 

  @Prop({ type: Object })
  metadata!: Record<string, any>; 

  @Prop({ type: Boolean, default: false })
  auto_print!: boolean;

  @Prop({ type: Boolean, default: false })
  auto_save_print!: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const MerchantSettingsSchema = SchemaFactory.createForClass(Settings);