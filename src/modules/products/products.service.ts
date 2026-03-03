/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, Inject, NotFoundException, Scope } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateProductSku } from '../../common/utils/generator/SKU';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { BaseTenantService } from '../../core/tenant/tenant.service';

// ✅ Tambahkan Scope.REQUEST karena tenant connection bersifat request-based
@Injectable({ scope: Scope.REQUEST })
export class ProductsService extends BaseTenantService {
  
  constructor(@Inject('TENANT_CONNECTION') connection: Connection) {
    // ✅ Teruskan koneksi ke parent (BaseTenantService)
    super(connection);
  }

  /**
   * Getter untuk model Product
   * Otomatis meregistrasi Category agar .populate('category_key') tidak error
   */
  private get productModel() {
    return this.getModel<Product>(Product.name, ProductSchema, [
      { name: Category.name, schema: CategorySchema },
    ]);
  }

  /**
   * Getter untuk model Category (khusus kebutuhan cari nama kategori untuk SKU)
   */
  private get categoryModel() {
    return this.getModel<Category>(Category.name, CategorySchema);
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Logika SKU otomatis jika tidak diisi
    if (!createProductDto.sku) {
      const category = await this.categoryModel.findById(createProductDto.category_key);
      
      // Gunakan helper SKU dengan mengirimkan model product dan nama kategori
      createProductDto.sku = await generateProductSku(
        this.productModel, 
        category?.name
      );
    }

    const createdProduct = new this.productModel(createProductDto);
    return await createdProduct.save();
  }

  async findAll() {
    return await this.productModel
      .find({ isDeleted: false })
      .populate('category_key')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findOne({ _id: id, isDeleted: false })
      .populate('category_key')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateProductDto },
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Gagal mengupdate, Product ID ${id} tidak ditemukan`);
    }
    return updatedProduct;
  }

  async remove(id: string) {
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: true },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Product ID ${id} tidak ditemukan`);
    }

    return { message: 'Product berhasil dihapus secara soft-delete' };
  }
}