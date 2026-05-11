/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
import { Injectable, Inject, NotFoundException, Scope, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Connection, Model, Types } from 'mongoose';
import { Request as ExpressRequest } from 'express';
import { Category, CategorySchema } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { slugify } from '../../common/utils/generator/SLUG';

@Injectable({ scope: Scope.REQUEST })
export class CategoriesService extends BaseTenantService {
  
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest // Tambahkan injection REQUEST
  ) {
    
    super(connection, request);
    const dbName = connection.name;
      const outletId = this.currentOutletId; // Menggunakan getter dari BaseTenantService
      console.log(`--- [Request Category] ---`);
      console.log(`📂 Database : ${dbName}`);
      console.log(`🏪 Outlet ID: ${outletId || 'TIDAK TERDETEKSI (Global/Owner)'}`);
      console.log(`--------------------------`);

  }  

  private get categoryModel(): Model<Category> {
    return this.getModel<Category>(Category.name, CategorySchema);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
   
    const oId = this.currentOutletId;
    
    if (!oId || !Types.ObjectId.isValid(oId)) {
      throw new BadRequestException('Outlet ID tidak valid atau tidak ditemukan di header');
    }

    let slug = slugify(createCategoryDto.name);
    // 2. Cek apakah slug sudah dipakai DI OUTLET YANG SAMA
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
      ...createCategoryDto,
      slug,
      outlet_id: new Types.ObjectId(oId)
    };

    const createdCategory = new this.categoryModel(dataWithOutlet);
    return await createdCategory.save();
  }

  async findAll() {
    // OTOMATIS: Filter menggunakan { outlet_id, isDeleted: false }
    return await this.categoryModel
      .find(this.outletFilter) 
      .sort({ order: 1 })
      .exec();
  }

  async findAllOptions() {
    return await this.categoryModel
      .find({ 
        ...this.outletFilter, 
        isActive: true 
      })
      .select('_id name') 
      .sort({ name: 1 }) 
      .exec();
  }

  async findOne(id: string) {
    // Tambahkan outletFilter agar user tidak bisa akses kategori outlet lain via ID
    const category = await this.categoryModel
      .findOne({ _id: id, ...this.outletFilter })
      .exec();

    if (!category) {
      throw new NotFoundException(`Kategori tidak ditemukan di outlet ini`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, ...this.outletFilter },
        { $set: updateCategoryDto },
        { new: true },
      )
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Gagal update, Kategori tidak ditemukan`);
    }
    return updatedCategory;
  }

  async remove(id: string) {
    // Soft delete tetap terbatas pada outlet yang aktif
    const result = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, ...this.outletFilter },
        { isDeleted: true, isActive: false },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Kategori tidak ditemukan`);
    }
    return { message: 'Kategori berhasil dinonaktifkan' };
  }
}