/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/inventory/inventory.controller.ts

import { Controller, Post, Body, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateStockLogDto } from './dto/create-stock-log.dto';

@ApiTags('Inventory')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('adjust')
  @ApiOperation({ summary: 'Update stok barang (In/Out/Adjustment)' })
  async adjustStock(@Body() dto: CreateStockLogDto) {
    // Note: userId nantinya diambil dari JWT token
    const userId = "65a1234567890abcdef12345"; 
    return this.inventoryService.updateStock(dto, userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lihat riwayat pergerakan stok produk' })
  async getHistory(
    @Query('product_id') productId: string,
    @Query('outlet_id') outletId: string
  ) {
    return this.inventoryService.getStockHistory(productId, outletId);
  }
}