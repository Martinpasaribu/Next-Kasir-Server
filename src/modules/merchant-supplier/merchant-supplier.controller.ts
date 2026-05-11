/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/merchant-supplier/merchant-supplier.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { MerchantSupplierService } from './merchant-supplier.service';
import { Supplier } from './schemas/supplier.schema';
import { Types } from 'mongoose';

@Controller('supplier')
// @UseGuards(JwtAuthGuard) // Aktifkan jika sudah ada guard authentication
export class MerchantSupplierController {
  constructor(private readonly supplierService: MerchantSupplierService) {}

  /**
   * Mendapatkan semua daftar supplier
   * GET /merchant/suppliers
   */
  @Get('/admin')
  async findAll(@Query() query: any) {
    return await this.supplierService.findAll(query);
  }

  /**
   * Menambah supplier baru
   * POST /suppliers
   */
  @Post('/admin')
  async create(@Body() createSupplierDto: Partial<Supplier>) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Get('/options')
  async getOptions() {
    return await this.supplierService.findAllOptions();
  }

    /**
   * Mendapatkan detail satu supplier
   * GET /suppliers/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.supplierService.findOne(id);
  }


  /**
   * Update data supplier
   * PUT /suppliers/:id
   */
  @Put(':id/admin')
  async update(
    @Param('id') id: string, 
    @Body() updateSupplierDto: Partial<Supplier>
  ) {
    return await this.supplierService.update(id, updateSupplierDto);
  }



  /**
   * Menonaktifkan supplier (Soft Delete)
   * DELETE /suppliers/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.supplierService.remove(id);
  }
}