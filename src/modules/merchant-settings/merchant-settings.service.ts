/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, Inject, Scope, Logger, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { Settings, MerchantSettingsSchema } from './schemas/merchant-settings.schema';

@Injectable({ scope: Scope.REQUEST })
export class MerchantSettingsService extends BaseTenantService {
  private readonly logger = new Logger(MerchantSettingsService.name);

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
  ) {
    super(connection, request);
  }

  private get settingsModel() {
    return this.getModel<Settings>(Settings.name, MerchantSettingsSchema);
  }

  /**
   */
  async getSettingsByDomain(domain: string) {
    return await this.settingsModel.findOne({
      outlet_id: this.currentOutletId,
      isDeleted: false,
      domain: domain
    });
  }


    /**
   * Mengambil settingan berdasarkan domain (APP, ADMIN, RECEIPT, GLOBAL)
   */

  async getSettingsStruct(): Promise<any> { // <--- Tambahkan : Promise<any>
    const result = await this.settingsModel.findOne({
      outlet_id: this.currentOutletId,
      isDeleted: false,
    });

    return result?.settings_receipt || result || null;
  }

  /**
   * Mengambil settingan struct 
  */

  async getSettingsStructSummary(): Promise<any> { // <--- Tambahkan : Promise<any>
    const result = await this.settingsModel.findOne({
      outlet_id: this.currentOutletId,
      isDeleted: false,
    });

    return result?.settings_receipt_summary || null;
  }

  /**
   * Update Global (Theme/Tax) - Tetap pakai domain GLOBAL agar tidak campur
   */
  async UpdateGlobalSetting(data: any) {
    try {
      const oId = this.currentOutletId;
      // Gunakan findOneAndUpdate agar jika data sudah ada (oId + domain cocok) dia UPDATE, bukan CREATE
      return await this.settingsModel.findOneAndUpdate(
        { outlet_id: oId },
        { 
          $set: { 
            domain: data.domain,
            app_theme: data.theme,
            tax_settings: data.tax,
            name_outlet: data.name_outlet,
            address: data.address,
            auto_print: data.auto_print,
            auto_save_print: data.auto_save_print,
          } 
        },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      throw new BadRequestException('Gagal update global setting');
    }
  }

  /**
   * Update Struk - Tetap pakai domain RECEIPT
   */
  async UpdateStructSetting(settingsReceipt: any) {
    try {
      const oId = this.currentOutletId;
      return await this.settingsModel.findOneAndUpdate(
        { outlet_id: oId},
        { 
          $set: { 
            settings_receipt: settingsReceipt,
            name_outlet: settingsReceipt.name?.value || '',
            address: settingsReceipt.address?.value || '',
            isDeleted: false 
          } 
        },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      throw new BadRequestException('Gagal update receipt setting');
    }
  }


  /**
   * Update Struk - Tetap pakai domain RECEIPT
   */
  async UpdateStructSummarySetting(settings_receipt_summary: any) {
    try {
      const oId = this.currentOutletId;
      if (!oId) throw new Error('Outlet ID is required');

      const data = await this.settingsModel.findOneAndUpdate(
        { outlet_id: oId },
        { 
          $set: { 
            settings_receipt_summary, // shorthand jika nama variabel sama
            isDeleted: false,
            updatedAt: new Date() // disarankan menambah ini
          } 
        },
        { upsert: true, new: true, runValidators: true } // runValidators memastikan input sesuai skema
      );

      return data || null;
      
    } catch (error: any) {
      console.error(error);
      throw new BadRequestException('Gagal update: ' + error.message);
    }
  }

  /**
   * INI YANG KAMU MAU:
   * Mengupdate settingan dengan domain sebagai penanda asal sistem (APP atau ADMIN)
   */
  async UpdateSetting(data: any) {
    try {
      const oId = this.currentOutletId;

      // Pisahkan domain dari data yang mau di-set agar tidak bentrok
      const {  ...pureData } = data;

      return await this.settingsModel.findOneAndUpdate(
        { 
          outlet_id: oId, 
        },
        { 
          $set: { 
            ...pureData,
            isDeleted: false 
          } 
        },
        { upsert: true, new: true }
      );
    } catch (error: any) {
      this.logger.error(`Error update setting: ${error.message}`);
      throw new BadRequestException('Gagal mengupdate settingan');
    }
  }
}