/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, Scope, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection, Types } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';

// Schemas
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Injectable({ scope: Scope.REQUEST })
export class RecipeService extends BaseTenantService {
  private readonly logger = new Logger(RecipeService.name);

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
  ) {
    super(connection, request);
  }

  private get recipeModel() {
    return this.getModel<Recipe>(Recipe.name, RecipeSchema);
  }

  private get inventoryModel() {
    return this.getModel<Inventory>(Inventory.name, InventorySchema);
  }
  
  private get productModel() {
    return this.getModel<Product>(Product.name, ProductSchema);
  }

  /**
   * Mendapatkan semua resep di outlet aktif
   */
  async findAll() {
    return await this.recipeModel
      .find(this.outletFilter)
      .populate('product_id', 'name sku price')
      .populate('ingredients.material_id', 'name unit sku average_cost')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Mencari satu resep berdasarkan Product ID
   */
  async findByProduct(productId: string) {
    const recipe = await this.recipeModel
      .findOne({ product_id: new Types.ObjectId(productId), ...this.outletFilter })
      .populate('ingredients.material_id')
      .exec();

    if (!recipe) throw new NotFoundException('Resep untuk produk ini belum didaftarkan');
    return recipe;
  }

  /**
   * Tambah Resep Baru
   */
  async create(data: { product_id: string; ingredients: { material_id: string; quantity: number }[] }) {
    
    try {

        const oId = this.currentOutletId;
        
        if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');

        // 1. Cek duplikasi (Unique Product ID per Outlet)
        const existing = await this.recipeModel.findOne({
            product_id: new Types.ObjectId(data.product_id),
            ...this.outletFilter
        });
        if (existing) throw new BadRequestException('Resep untuk produk ini sudah ada');

        // 2. Validasi bahan baku di inventory
        const materialIds = data.ingredients.map(i => new Types.ObjectId(i.material_id));
            const invCount = await this.inventoryModel.countDocuments({
            _id: { $in: materialIds },
            ...this.outletFilter
        });

        if (invCount !== data.ingredients.length) {
            throw new BadRequestException('Beberapa bahan baku tidak valid atau milik outlet lain');
        }

        // 3. Simpan
        const newRecipe = new this.recipeModel({
            product_id: new Types.ObjectId(data.product_id),
            outlet_id: new Types.ObjectId(oId), // Pastikan field ini ada di schema
            ingredients: data.ingredients.map(i => ({
                material_id: new Types.ObjectId(i.material_id),
                quantity: i.quantity
            }))
        });

        const result = await newRecipe.save();

        await this.productModel
          .findOneAndUpdate(
            { _id: new Types.ObjectId(data.product_id), },
            { recipe_id: result._id },
        )

        return result 

        } catch (error: any) {
        // Cek jika error adalah Duplicate Key dari MongoDB
        if (error.code === 11000) {
        throw new ConflictException('Resep untuk produk ini sudah terdaftar');
        }
        // Lempar kembali error asli jika bukan 11000
        throw error;
    }
  }

  /**
   * Update Resep
   */
  async update(productId: string, ingredients: { material_id: string; quantity: number }[]) {
    const recipe = await this.recipeModel.findOneAndUpdate(
      { product_id: new Types.ObjectId(productId), ...this.outletFilter },
      { 
        $set: { 
          ingredients: ingredients.map(i => ({
            material_id: new Types.ObjectId(i.material_id),
            quantity: i.quantity
          }))
        } 
      },
      { new: true }
    );

    if (!recipe) throw new NotFoundException('Resep tidak ditemukan');
    return recipe;
  }

  /**
   * Hapus Resep
   */


  async remove(id: string) {
    const result = await this.recipeModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: true },
        { isActive: false }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Product ID ${id} tidak ditemukan`);
    }

    return { message: 'Product berhasil dihapus secara soft-delete' };
  }

      
  // async remove(productId: string) {
  //   const result = await this.recipeModel.deleteOne({
  //     product_id: new Types.ObjectId(productId),
  //     ...this.outletFilter
  //   });
  //   return { deleted: result.deletedCount > 0 };
  // }
}