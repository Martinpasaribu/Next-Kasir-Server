/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Outlet, OutletSchema } from './schemas/outlet.schema';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
import { generateOutletCode } from 'src/common/utils/generator/CODE_OUT';

@Injectable()
export class OutletService {
  private outletModel: Model<Outlet>;

  constructor(@Inject('TENANT_CONNECTION') private connection: Connection) {
    // Inisialisasi model outlet secara dinamis berdasarkan database tenant
    this.outletModel = this.connection.model(Outlet.name, OutletSchema);
  }

  async create(createOutletDto: CreateOutletDto): Promise<Outlet> {
    

    if (!createOutletDto.code) {
      
      // Gunakan helper SKU dengan mengirimkan model product dan nama kategori
      createOutletDto.code = await generateOutletCode(
        this.outletModel, 
        createOutletDto?.name
      );
    }
    
    const createdOutlet = new this.outletModel(createOutletDto);

    return await createdOutlet.save();
  }

  async findAll() {
    // Mengambil semua outlet yang aktif dan belum dihapus
    return await this.outletModel
      .find({ isDeleted: false })
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const outlet = await this.outletModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!outlet) {
      throw new NotFoundException(`Outlet dengan ID ${id} tidak ditemukan`);
    }
    return outlet;
  }

  async update(id: string, updateOutletDto: UpdateOutletDto) {
    const updatedOutlet = await this.outletModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateOutletDto },
        { new: true },
      )
      .exec();

    if (!updatedOutlet) {
      throw new NotFoundException(`Gagal mengupdate, Outlet ID ${id} tidak ditemukan`);
    }
    return updatedOutlet;
  }

  async remove(id: string) {
    // Soft delete untuk menjaga integritas data transaksi historis
    const result = await this.outletModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: true, isActive: false },
        { new: true }
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Gagal menghapus, Outlet ID ${id} tidak ditemukan`);
    }

    return { message: 'Outlet berhasil dinonaktifkan (soft-delete)' };
  }
}