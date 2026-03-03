// src/modules/outlet/outlet.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { OutletService } from './outlet.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';

@ApiTags('Outlet')
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID Database Tenant' })
@Controller('outlets')
export class OutletController {
  constructor(private readonly outletService: OutletService) {}

  @Post()
  @ApiOperation({ summary: 'Menambah cabang/outlet baru' })
  create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletService.create(createOutletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Melihat daftar semua outlet' })
  findAll() {
    return this.outletService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail outlet berdasarkan ID' })
  findOne(@Param('id') id: string) {
    return this.outletService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update informasi outlet' })
  update(@Param('id') id: string, @Body() updateOutletDto: UpdateOutletDto) {
    return this.outletService.update(id, updateOutletDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menonaktifkan outlet (Soft Delete)' })
  remove(@Param('id') id: string) {
    return this.outletService.remove(id);
  }
}