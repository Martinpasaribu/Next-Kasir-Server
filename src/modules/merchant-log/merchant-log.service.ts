/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// src/modules/merchant-log/merchant-journal.service.ts

import { Injectable, Inject, Scope, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Connection, Types } from 'mongoose';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { LogInventory, MerchantLogInventorySchema } from './schemas/merchant-log-inventory.schema';
import { LogTransaction, MerchantLogTransactionSchema } from './schemas/merchant-log-transaction.schema';

@Injectable({ scope: Scope.REQUEST })
export class MerchantLogsService extends BaseTenantService {
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
  ) {
    super(connection, request);
  }

  private get journalModel() {
    return this.getModel<LogInventory>(LogInventory.name, MerchantLogInventorySchema);
  }

  private get logTransactionModel() {
    return this.getModel<LogTransaction>(LogTransaction.name, MerchantLogTransactionSchema);
  }

  /**
   * Mencatat mutasi ke Jurnal Umum Merchant
   */
  async recordEntryInventory(data: {
    domain: 'INVENTORY' | 'PRODUCT';
    action_type: string;
    reference_id?: string | Types.ObjectId;
    quantity?: number;
    unit_price?: number;
    note?: string;
    metadata?: any;
  }) {
    const userId = (this.request as any).user?._id; // Tergantung struktur Auth kamu

    const qty = data.quantity || 0;
    const price = data.unit_price || 0;

    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID wajib diisi');
    

    const entry = new this.journalModel({
      ...data,
      outlet_id: new Types.ObjectId(oId),
      reference_id: data.reference_id ? new Types.ObjectId(data.reference_id) : undefined,
      performed_by: userId ? new Types.ObjectId(userId) : undefined,
      total_value: qty * price
    });

    return await entry.save();
  }


    /**
   * Mencatat mutasi ke Jurnal Umum Merchant
   */
  async recordEntryTransaction(data: {
    domain: 'TRX' | '';
    action_type: string;
    reference_id?: string | Types.ObjectId;
    quantity?: number;
    total_value?: number;
    note?: string;
    metadata?: any;
  }) {
    const userId = (this.request as any).user?._id; // Tergantung struktur Auth kamu

    const qty = data.quantity || 0;
    const price = data.total_value || 0;

    const oId = this.currentOutletId;
    if (!oId) throw new BadRequestException('Outlet ID wajib diisi');
    

    const entry = new this.logTransactionModel({
      ...data,
      outlet_id: new Types.ObjectId(oId),
      reference_id: data.reference_id ? new Types.ObjectId(data.reference_id) : undefined,
      performed_by: userId ? new Types.ObjectId(userId) : undefined,
      total_value: qty * price
    });

    return await entry.save();
  }

}