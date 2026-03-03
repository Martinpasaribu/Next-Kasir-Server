// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah kategori produk baru' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua kategori aktif' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('options')
  async getOptions() {
    return await this.categoriesService.findAllOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail kategori' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200) // Memastikan status code 200, bukan 204
  @ApiOperation({ summary: 'Update kategori' })
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, updateCategoryDto);
    return {
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: data
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus kategori (Soft Delete)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}