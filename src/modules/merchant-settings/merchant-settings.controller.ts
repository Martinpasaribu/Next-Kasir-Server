/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { MerchantSettingsService } from './merchant-settings.service';

@Controller('merchant-settings')
export class MerchantSettingsController {
  constructor(private readonly merchantSettingsService: MerchantSettingsService) {}


  /* --- Tambahan jika ingin mengambil Receipt secara eksplisit --- */
  @Get('receipt')
  async getReceiptConfig() {
    return await this.merchantSettingsService.getSettingsStruct();
  }

  /* --- Tambahan jika ingin mengambil Receipt secara eksplisit --- */
  @Get('receipt-summary')
  async getReceiptSummaryConfig() {
    const result =  await this.merchantSettingsService.getSettingsStructSummary();

    return {
      status : true,
      message: "berhasil Mengambil summary Struct",
      data: result
    }
  }

  /**
   * Mengambil settingan berdasarkan domain secara dinamis (GLOBAL, RECEIPT, PRODUCT, dll)
   * GET: /merchant-settings/domain/RECEIPT
   */
  @Get('general/:domain')
  async getByDomain(@Param('domain') domain: string) {
    return await this.merchantSettingsService.getSettingsByDomain(domain);
  }

  /**
   * Endpoint Khusus Update Konfigurasi Struk
   * PATCH: /merchant-settings/receipt
   */

  @Patch('receipt/:domain')
  async updateReceipt(@Body() body: any) {
    // Pastikan kita hanya mengambil objek settings_receipt jika dikirim dalam wrapper
    const data = body.settings_receipt ? body.settings_receipt : body;
    return await this.merchantSettingsService.UpdateStructSetting(data);
  }

  /**
   * Endpoint Khusus Update Konfigurasi Struk summary
   * PATCH: /merchant-settings/receipt-summary
   */

  @Patch('receipt-summary/:domain')
  async updateReceiptSummary(@Body() body: any) {
    // Pastikan kita hanya mengambil objek settings_receipt jika dikirim dalam wrapper
    const data = body.settings_receipt_summary ? body.settings_receipt_summary : body;
    const result =  await this.merchantSettingsService.UpdateStructSummarySetting(data);

    return {
      status : true,
      message: "berhasil update summary Struct",
      data: result,
    }
  }k


  /**
   * Endpoint Khusus Update Konfigurasi Global (Theme, Tax, Shop Info)
   * PATCH: /merchant-settings/general
   */
  @Patch('general/:domain')
  async updateGeneral(@Body() body: any) {
    // Pastikan properti body sesuai dengan yang dikirim dari useMerchantSettings (Nuxt)
    return await this.merchantSettingsService.UpdateGlobalSetting({
      domain: body.domain,
      theme: body.app_theme,    // mapping dari app_theme ke theme
      tax: body.tax_settings,   // mapping dari tax_settings ke tax
      name_outlet: body.name_outlet,
      address: body.address,
      auto_print: body.auto_print,
      auto_save_print: body.auto_save_print,
      description: body.description
    });
  }

  /**
   * Update Settingan Umum berdasarkan domain (Fallback)
   * PATCH: /merchant-settings/update-any
   */
  @Patch('update-any')
  async updateAny(@Body() body: any) {
    if (!body.domain) {
      throw new BadRequestException('Domain wajib disertakan');
    }
    return await this.merchantSettingsService.UpdateSetting(body);
  }


}