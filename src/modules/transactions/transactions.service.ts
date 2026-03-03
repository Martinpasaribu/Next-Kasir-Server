/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable operator-linebreak */
/* eslint-disable max-len */

import { Injectable, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BaseTenantService } from '../../core/tenant/tenant.service';
import { CustomerService } from '../customer/customer.service';
import { Customer, CustomerSchema } from '../customer/schemas/customer.schema';
import { generateTRX } from '../../common/utils/generator/TRX';


@Injectable()
export class TransactionsService extends BaseTenantService  {
  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    private readonly inventoryService: InventoryService, // Inject InventoryService untuk update stok
    private readonly customerService: CustomerService,
  ) {
    // ✅ Teruskan koneksi ke parent (BaseTenantService)
    super(connection);
  }

  private get transactionModel() {
    return this.getModel<Transaction>(Transaction.name, TransactionSchema);
  }

  // TAMBAHKAN INI: Agar model Customer terdaftar di koneksi Mongoose
  private get customerModel() {
    return this.getModel<Customer>(Customer.name, CustomerSchema);
  }


  async create(dto: CreateTransactionDto, userId: string) {
    // Gunakan Mongoose Session untuk ACID Transaction
    // Jika simpan transaksi gagal, stok tidak jadi terpotong (Rollback)
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { product_key, outlet_id, payments, sub_amount } = dto;

      // --- 2. LOGIKA CUSTOMER ATOMIC ---
      let finalCustomerKey = dto.customer_key;

      // Jika ada data customer utuh dari frontend (Dexie)
      if (dto.customer_data && dto.customer_data.name && dto.customer_data.phone) {
        const customer = await this.customerService.createOrUpdate(dto.customer_data);
        // console.log(`Customer In : ${dto.customer_data ? JSON.stringify(dto.customer_data) : 'No customer data'}`);
        // console.log(`Customer Out: ${customer ? JSON.stringify(customer) : 'Customer not created/updated'}`);
        finalCustomerKey = new Types.ObjectId(customer._id as unknown as string); 
      }

      // 1. Validasi Perhitungan Sederhana (Security Check)

      // Pastikan shippingFee ada, jika tidak set ke 0
      const safeShippingFee = dto.shippingFee ?? 0;

      // Pastikan discount ada dan memiliki nilai default
      const safeDiscountNominal = dto.discount?.nominal ?? 0;
      const discountType = dto.discount?.type ?? 'fixed';

      // Hitung ulang discountAmount berdasarkan tipe
      const discountVal = discountType === 'percentage' 
        ? (sub_amount * safeDiscountNominal) / 100 
        : safeDiscountNominal;

      // Hitung Pajak (10%)
      const taxVal = (sub_amount - discountVal) * 0.1;

      // Hitung Total yang seharusnya (Expected)
      // Gunakan Math.max untuk memastikan total tidak negatif jika diskon terlalu besar
      const expectedTotal = Math.max(0, (sub_amount - discountVal) + taxVal + safeShippingFee);

      
      // Validasi kecocokan dengan data frontend
      if (Math.abs(dto.total_amount - expectedTotal) > 2) { 
        throw new BadRequestException(`Perhitungan total tidak valid. Harusnya: ${expectedTotal}`);
      }
      // Cek apakah total_amount dari frontend sinkron dengan perhitungan backend
      if (Math.abs(dto.total_amount - expectedTotal) > 1) { // toleransi pembulatan 1 rupiah
        throw new BadRequestException('Perhitungan total transaksi tidak valid');
      }

      // 2. Cek Total Pembayaran (Termasuk DP)
      const totalPaid = payments.reduce((sum, p) => sum + p.price, 0);
      
      // Tentukan Status Transaksi berdasarkan total bayar
      let transactionStatus: 'PAID' | 'PARTIAL' | 'PENDING' = 'PAID';
      if (totalPaid <= 0) transactionStatus = 'PENDING';
      else if (totalPaid < dto.total_amount) transactionStatus = 'PARTIAL';

      const finalTrxId = dto.trx_id || await generateTRX(this.transactionModel);

      // 3. Simpan Transaksi
      const transaction = new this.transactionModel({
        ...dto,
        trx_id: finalTrxId, // Gunakan variabel tunggal agar konsisten
        status: transactionStatus,
        created_by: userId,
        cashier_key: userId,
        customer_key: finalCustomerKey,
      });
      
      const savedTransaction = await transaction.save({ session });

      // 4. POTONG STOK & CATAT LOG
      for (const item of product_key) {
        await this.inventoryService.updateStock({
          product_id: item.product_id,
          outlet_id: outlet_id,
          amount: item.qty, // Angka positif karena dikurangi di dalam service inventory
          type: 'SALE',
          reason: `Penjualan ${transaction.trx_id}`,
        }, userId); 
        // Note: Pastikan inventoryService.updateStock juga mendukung session jika ingin full-rollback
      }

      await session.commitTransaction();
      return savedTransaction;

    } catch (error :any) {
      await session.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal memproses transaksi: ' + error.message);
    } finally {
      session.endSession();
    }
  }

  async findAll() {
    this.customerModel;
    return await this.transactionModel
      .find()
      .sort({ createdAt: -1 })
      .populate('customer_key') // Populate customer jika ada
      .exec();
  }
}