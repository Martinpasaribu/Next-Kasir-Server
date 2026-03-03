/* eslint-disable @typescript-eslint/no-unused-vars */

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
// Header ini wajib ada agar middleware/tenant provider bisa menentukan database mana yang dipakai
@ApiHeader({ 
  name: 'x-tenant-id', 
  description: 'ID Bisnis / Nama Database Tenant', 
  required: true 
})

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat produk baru untuk tenant tertentu' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Mengambil semua produk (mendukung filter & search)' })
  findAll() {
    // Anda bisa menambahkan @Query() jika ingin fitur search/filter di masa depan
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mengambil detail satu produk' })
  findOne(@Param('id') id: string) {
    // Hapus tanda '+' karena MongoDB ID adalah string, bukan number
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mengupdate data produk' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    // Hapus tanda '+'
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus produk (Soft Delete)' })
  remove(@Param('id') id: string) {
    // Hapus tanda '+'
    return this.productsService.remove(id);
  }
}