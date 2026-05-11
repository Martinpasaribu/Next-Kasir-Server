/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MerchantOverviewService } from './merchant-overview.service';

@Controller('merchant-overview')
export class MerchantOverviewController {
  constructor(private readonly merchantOverviewService: MerchantOverviewService) {}

@Get('stats')
  async getStats() {
    return await this.merchantOverviewService.getGlobalStats();
  }

  /**
   * Endpoint Dashboard Utama (Gabungan)
   * Digunakan untuk loading pertama kali halaman dashboard
   */

  @Get('dashboard')
  async getMainDashboard(@Query('days') days: number) {
    // Memberikan default 30 hari jika param tidak ada
    const range = days ? Number(days) : 30;
    return await this.merchantOverviewService.getMainDashboard(range);
  }

  /**
   * Endpoint Finansial (Pilar A)
   */
  @Get('performance')
  async getPerformance(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date();
    return await this.merchantOverviewService.getFinancialPerformance(startDate, endDate);
  }

  /**
   * Endpoint Stok & Inventaris (Pilar B)
   */
  @Get('inventory-health')
  async getInventoryHealth() {
    return await this.merchantOverviewService.getInventoryHealth();
  }

  /**
   * Endpoint Analisis Produk & Kategori (Pilar C)
   */
  @Get('product-analytics')
  async getProductAnalytics(@Query('limit') limit: number) {
    return await this.merchantOverviewService.getProductAnalytics(limit || 5);
  }

  @Get('journal')
  async getJournal(@Query() query: any) {
    // Ganti dari getMainDashboard() ke getJournalEntries(query)
    return await this.merchantOverviewService.getJournalEntries(query);
  }


/**
   * Endpoint Spesifik: Grafik Inventory Keluar Harian
   * Panggilan: /merchant-overview/inventory-daily?month=4&year=2026
   */
  @Get('inventory/chart-full')
  async getInventoryDaily(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    // Pastikan menggunakan tahun/bulan saat ini jika tidak ada input
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    return await this.merchantOverviewService.getFullInventoryAnalytics(targetMonth, targetYear);
  }

}
