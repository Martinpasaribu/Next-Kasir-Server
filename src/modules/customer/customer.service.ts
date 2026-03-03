/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { BaseTenantService } from 'src/core/tenant/tenant.service'; // Sesuaikan path-nya

@Injectable()
export class CustomerService extends BaseTenantService { // <--- Wajib extends ini

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
  ) {
    // Teruskan koneksi ke BaseTenantService agar getModel bisa bekerja
    super(connection);
  }

  // Mengambil model berdasarkan koneksi tenant saat ini
  private get customerModel() {
    return this.getModel<Customer>(Customer.name, CustomerSchema);
  }

  async createOrUpdate(createCustomerDto: CreateCustomerDto) {
    const { phone } = createCustomerDto;
    
    // Upsert: Cari by phone, jika tidak ada buat baru, jika ada update
    return await this.customerModel.findOneAndUpdate(
      { phone }, 
      { ...createCustomerDto },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    ).exec();
  }

  async findAll() {
    return await this.customerModel.find().sort({ createdAt: -1 }).exec();
  }
}