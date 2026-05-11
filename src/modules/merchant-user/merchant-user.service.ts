/* eslint-disable max-len */
/* eslint-disable function-paren-newline */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/modules/auth/merchant-user.service.ts

import { Injectable, ConflictException, NotFoundException, Scope, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { MerchantUser, MerchantUserSchema } from './schemas/merchant-user.schema';
import { CreateMerchantUserDto } from './dto/create-merchant-user.dto';
import { UpdateMerchantUserDto } from './dto/update-merchant-user.dto';
import { BaseTenantService } from '@/core/tenant/tenant.service';

@Injectable({ scope: Scope.REQUEST }) // Memastikan data antar toko tidak tertukar saat diakses bersamaan.
export class MerchantUserService extends BaseTenantService {


  constructor(@Inject('TENANT_CONNECTION') connection: Connection) {
    // ✅ Teruskan koneksi ke parent (BaseTenantService)
    super(connection);
  }
  
  private get userModel() {
      console.log('Current DB:', this.connection.name);
    // Ganti MerchantUser menjadi MerchantUserSchema pada parameter ke-2
    return this.getModel<MerchantUser>(
      MerchantUser.name, 
      MerchantUserSchema, // <--- INI PERBAIKANNYA
      [{ name: MerchantUser.name, schema: MerchantUserSchema }]
    );
  }
        

  async create(createDto: CreateMerchantUserDto): Promise<MerchantUser> {
    const { password, ...data } = createDto;

    // Cek apakah username/email sudah ada
    const existingUser = await this.userModel.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });

    if (existingUser) {
      throw new ConflictException(`${data.username} atau ${data.email} sudah terdaftar`);
    }

    // Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...data,
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async findAll() {
    // Kita filter agar data yang sudah di-soft-delete tidak muncul
    return this.userModel.find({ isDeleted: false }).exec();
  }

  async findAllRole(role: string) {
    // Kita filter agar data yang sudah di-soft-delete tidak muncul
    return this.userModel.find(
      { 
        isDeleted: false,
        role
      })
      .exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('ID tidak valid');
    
    const user = await this.userModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!user) throw new NotFoundException('User tidak ditemukan');
    
    return user;
  }

  async update(id: string, updateDto: UpdateMerchantUserDto) {
    const dataToUpdate = { ...updateDto };

    // Jika ada update password, hash ulang
    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, dataToUpdate, { new: true })
      .exec();

    if (!updatedUser) throw new NotFoundException('User tidak ditemukan atau sudah dihapus');
    return updatedUser;
  }

  async remove(id: string) {
    // Soft Delete: Ubah flag isDeleted menjadi true
    const result = await this.userModel
      .findByIdAndUpdate(id, { isDeleted: true, isActive: false })
      .exec();

    if (!result) throw new NotFoundException('User tidak ditemukan');
    return { message: 'User berhasil dihapus (soft delete)' };
  }
}