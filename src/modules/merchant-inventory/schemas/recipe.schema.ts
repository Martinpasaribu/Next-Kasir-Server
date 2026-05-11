/* eslint-disable max-len */
// src/modules/products/schemas/recipe.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Recipe extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
  product_id!: Types.ObjectId; 

  @Prop([{
    // UBAH REFF KE INVENTORY
    material_id: { type: Types.ObjectId, ref: 'Inventory', required: true }, 
    quantity: { type: Number, required: true }, 
  }])
  ingredients!: { material_id: Types.ObjectId; quantity: number }[];

  @Prop({ type: Types.ObjectId, ref: 'Outlet', required: true, index: true })
  outlet_id!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;

}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);