// src/modules/transactions/transactions.controller.ts
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { Controller, Post, Body, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions')
@ApiHeader({ name: 'x-tenant-id', required: true })
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Proses pembayaran kasir' })
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    // Nantinya userId diambil dari JWT token
    const userId = "65a1234567890abcdef12345"; 
    const data = await  this.transactionsService.create(createTransactionDto, userId);
    return {
      success: true,
      message: 'Transaksi berhasil di peroses',
      data: data
    }; 
  }

  @Get('history')
  @ApiOperation({ summary: 'Lihat riwayat semua transaksi' })
  async findAll() {
    return this.transactionsService.findAll();
  }
}