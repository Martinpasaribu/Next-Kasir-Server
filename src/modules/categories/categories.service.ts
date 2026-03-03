/* eslint-disable max-len */
import { Injectable, Inject, NotFoundException, Scope } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// ✅ Tambahkan scope REQUEST agar service ini dibuat ulang setiap ada request tenant baru
@Injectable({ scope: Scope.REQUEST })
export class CategoriesService {
  
  constructor(@Inject('TENANT_CONNECTION') private connection: Connection) {}

  /**
   * ✅ Gunakan Getter untuk mengambil model.
   * Ini memastikan model dipanggil dari koneksi tenant yang aktif saat request berlangsung.
   */
  private get categoryModel(): Model<Category> {
    if (!this.connection) {
      throw new Error('Database connection for tenant not found');
    }
    return this.connection.model(Category.name, CategorySchema);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Gunakan this.categoryModel (memanggil getter)
    const createdCategory = new this.categoryModel(createCategoryDto);
    return await createdCategory.save();
  }

  async findAll() {
    return await this.categoryModel
      .find({ isDeleted: false })
      .sort({ order: 1 })
      .exec();
  }

  async findAllOptions() {
    return await this.categoryModel
      .find({ isDeleted: false, isActive: true }) // Pastikan hanya kategori aktif yang muncul di opsi
      .select('_id name') // Hanya ambil ID dan Nama
      .sort({ name: 1 }) // Urutkan berdasarkan abjad agar mudah dicari di UI
      .exec();
  }


  async findOne(id: string) {
    const category = await this.categoryModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!category) {
      throw new NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updatedCategory = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateCategoryDto },
        { new: true },
      )
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Gagal update, Kategori ID ${id} tidak ditemukan`);
    }
    return updatedCategory;
  }

  async remove(id: string) {
    const result = await this.categoryModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: true, isActive: false },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Kategori ID ${id} tidak ditemukan`);
    }
    return { message: 'Kategori berhasil dinonaktifkan' };
  }
}