/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, Inject, NotFoundException, Scope, BadRequestException } from '@nestjs/common';
import { Product, ProductSchema } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { generateProductSku } from '../../common/utils/generator/SKU';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { slugify } from '@/common/utils/generator/SLUG';
import { Connection, Model, Types } from 'mongoose';
import { MerchantLogsService } from '../merchant-log/merchant-log.service';


// ✅ Tambahkan Scope.REQUEST karena tenant connection bersifat request-based // Memastikan data antar toko tidak tertukar saat diakses bersamaan.
@Injectable({ scope: Scope.REQUEST })
export class ProductsService extends BaseTenantService {
  
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
    private readonly journalService: MerchantLogsService,
  ) {
    super(connection, request);
    const dbName = connection.name;
      const outletId = this.currentOutletId; // Menggunakan getter dari BaseTenantService
      console.log(`--- [Request Category] ---`);
      console.log(`📂 Database : ${dbName}`);
      console.log(`🏪 Outlet ID: ${outletId || 'TIDAK TERDETEKSI (Global/Owner)'}`);
      console.log(`--------------------------`);
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
    
    const oId = this.currentOutletId;
    
    if (!oId || !Types.ObjectId.isValid(oId)) {
      throw new BadRequestException('Outlet ID tidak valid atau tidak ditemukan di header');
    }

    if (!createProductDto.sku) {
      const category = await this.categoryModel.findById(createProductDto.category_key);
      
      createProductDto.sku = await generateProductSku(
        this.productModel, 
        category?.name
      );
    }

    let slug = slugify(createProductDto.name);

    const isSlugExists = await this.categoryModel.findOne({ 
      slug, 
      outlet_id: new Types.ObjectId(oId),
      isDeleted: false 
    });

    // 3. Jika sudah ada, tambahkan suffix random agar tidak Error E11000
    if (isSlugExists) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
    }

    const dataWithOutlet = {
      ...createProductDto,
      slug,
      outlet_id: new Types.ObjectId(oId)
    };

    const createdProduct = new this.productModel(dataWithOutlet);
    return await createdProduct.save();
  }

  async findAllToAdmin() {
    return await this.productModel
      .find(this.outletFilter) 
      .populate('category_key')
      .sort({ order: 1 })
      .exec();
  }

  async findAllToCashier() {
    // Gunakan Promise.all agar pengambilan kategori dan produk berjalan bersamaan
    // Ini akan membuat respon API jauh lebih cepat daripada menunggu satu per satu
    const [category_option, product] = await Promise.all([
      this.categoryModel
        .find({ ...this.outletFilter, isActive: true })
        .select('_id name ref_code')
        // .sort({ name: 1 })
        .lean() // .lean() membuat query lebih ringan karena tidak mengubah hasil ke Mongoose Document
        .exec(),

      this.productModel
        .find({ ...this.outletFilter, isActive: true })
        .select('_id name sku sub_description category_key price_buy price_sell stock order min_stock_alert icon unit isActive recommend isDeleted createdAt updatedAt')
        .populate('category_key', 'name ref_code') // Optimasi: hanya ambil field 'name' dari kategori
        .sort({ createdAt: -1 })
        .lean()
        .exec()
    ]);

    return {
        category_option,
        product
    };
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

  async findAllOptions() {
    return await this.productModel
      .find({ 
        ...this.outletFilter, 
        isActive: true 
      })
      .select('_id name') 
      .sort({ name: 1 }) 
      .exec();
  }

  async findAllOptionsWithRecipes() {
    return await this.productModel
      .find({ 
        ...this.outletFilter, 
        isActive: true,
        recipe_id:  null 
      })
      .select('_id name') 
      .sort({ name: 1 }) 
      .exec();
  }

    /**
     * FUNGSI B: Tambah Stok Manual (Tanpa Supplier yang Kompleks)
     * Digunakan untuk input stok cepat tanpa hitung moving average yang rumit
     */

    async manualAddStock(
      id: string, // ID langsung dari parameter controller
      data: { quantity: number; cost: number; note?: string }
    ) {
      const oId = this.currentOutletId;
      if (!oId) throw new BadRequestException('Outlet ID wajib diisi');
  
      // Siapkan objek update
      const updateQuery: any = {
        $inc: { stock: data.quantity } 
      };
  
      // Update HPP hanya jika barang masuk (positif)
      if (data.quantity > 0) {
        updateQuery.$set = { average_cost: data.cost };
      }
  
      const prod = await this.productModel.findOneAndUpdate(
        { 
          _id: new Types.ObjectId(id), 
          outlet_id: new Types.ObjectId(oId) // Safety check: pastikan milik outlet yg login
        },
        updateQuery,
        { returnDocument: 'after' }
      );
  
      if (!prod) throw new NotFoundException('Product tidak ditemukan');
  
      await this.journalService.recordEntryInventory({
        domain: 'PRODUCT',
        action_type: data.quantity > 0 ? 'RESTOCK_SUPP' : 'ADJUSTMENT_OUT',
        reference_id: prod._id, 
        quantity: Number(data.quantity),
        unit_price: 0, 
        note: data.note || (data.quantity > 0 ? 'Penambahan manual' : 'Adjustment keluar')
      });
  
      return prod;
    }


    /**
     * Fungsi Utama: Tambah stok dari Supplier (Restock)
     */
  
    async restockFromSupplier(
      id: string, // ID langsung dari parameter controller
      data: {
        quantity: number;
        costPerItem: number;
        supplierId: string;
        note?: string;
      },
      session?: any
    ) {
  
      const oId = this.currentOutletId;
      if (!oId) throw new BadRequestException('Outlet ID tidak ditemukan');
  
  
      const prod = await this.productModel.findOne({
        _id: new Types.ObjectId(id),
        outlet_id: new Types.ObjectId(oId)
      }).session(session).exec();
  
      if (!prod) throw new NotFoundException('PRODUCT tidak ditemukan');
  
      // Kalkulasi Moving Average Cost
      const currentStock = prod.stock > 0 ? prod.stock : 0;
      const currentHpp = prod.price_buy || 0;
      const totalNewStock = currentStock + data.quantity;
      
      // Rumus: ((Stock Lama * HPP Lama) + (Stock Baru * Harga Baru)) / Total Stok
      const newAverageCost = ((currentStock * currentHpp) + (data.quantity * data.costPerItem)) / totalNewStock;
  
      prod.stock = totalNewStock;
      prod.price_buy = Math.round(newAverageCost);
      
      if (data.supplierId && !prod.supplier_id.includes(new Types.ObjectId(data.supplierId))) {
        prod.supplier_id.push(new Types.ObjectId(data.supplierId));
      }
  
      await prod.save({ session });
     
      await this.journalService.recordEntryInventory({
        domain: 'PRODUCT',
        action_type: data.quantity > 0 ? 'RESTOCK_SUPP' : 'ADJUSTMENT_IN',
        reference_id: prod._id, 
        quantity: Number(data.quantity),
        unit_price: data.costPerItem,
        metadata: data,
        note: data.note || (data.quantity > 0 ? 'Penambahan Supplier' : 'Adjustment Masuk')
      });
  
      return prod;
    }

}