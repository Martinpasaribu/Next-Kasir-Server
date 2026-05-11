/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable function-paren-newline */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/agent-assistant/agent-assistant.service.tst/no-unsafe-assignment */

import { REQUEST } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Injectable, Inject, Scope, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import { BaseTenantService } from '@/core/tenant/tenant.service';

import { GeminiStrategy } from './strategies/gemini.strategy';
import { ClaudeStrategy } from './strategies/claude.strategy';
import { GrokStrategy } from './strategies/grok.strategy';
import { RedisService } from '@/core/config/redis/redis.service';
import { SourceLibrary } from './library/source.library';
import { BUSINESS_KNOWLEDGE } from './library/business-library';

@Injectable({ scope: Scope.REQUEST })
export class AgentAssistantService extends BaseTenantService {
  private activeStrategy: any;

  constructor(
    @Inject('TENANT_CONNECTION') connection: Connection,
    @Inject(REQUEST) request: ExpressRequest,
    @Inject('REDIS_CACHE') private redis: any,
    // AI Strategies
    private historyService: RedisService,
    private sourceLib: SourceLibrary,
    private gemini: GeminiStrategy,
    private claude: ClaudeStrategy,
    private grok: GrokStrategy,
  ) {
    super(connection, request);
    
    // Set active strategy berdasarkan ENV
    const currentAi = process.env.CURRENT_AI?.toLowerCase() || 'gemini';
    const map = { gemini: this.gemini, claude: this.claude, grok: this.grok };
    this.activeStrategy = map[currentAi];
  }



  // Fungsi Utama Tanya Jawab

  async ask(question: string) {
    const oId = this.currentOutletId;
    const tId = this.currentTenantId;

    if (!oId || !tId) throw new BadRequestException('Tenant atau Outlet ID tidak valid');
    
    // 1. Cek Cache Instan lewat Redis Service
    // Logika hashing MD5 sudah dibungkus di dalam getCache
    const cachedResponse = await this.historyService.getCache(tId, oId, question);
    if (cachedResponse) {
      console.log('🎯 REDIS HIT: Respon cepat dari cache.');
      return cachedResponse;
    }

    // 2. Ambil Riwayat Percakapan (History)
    // Supaya Gemini ingat konteks chat sebelumnya
    const chatHistory = await this.historyService.getHistory(tId, oId);

    // 3. Ambil Data Konteks & Tanya AI
    const contextData = await this.sourceLib.gatherContext(new Types.ObjectId(oId), question);
    const finalPrompt = this.buildFinalPrompt(question, contextData);
    
    // Kirim prompt beserta history-nya ke Gemini
    const aiResponse = await this.activeStrategy.analyze(contextData, finalPrompt, chatHistory);

    // 4. Simpan Semuanya ke Redis lewat Service
    // setCache akan otomatis melakukan debugging log (🟢 atau 🔴)
    await this.historyService.setCache(tId, oId, question, aiResponse);
    
    // Update riwayat chat agar ingatan Gemini bertambah
    await this.historyService.appendHistory(tId, oId, 'user', question);
    await this.historyService.appendHistory(tId, oId, 'model', aiResponse);

    return aiResponse;
  }

  // Penentuan informasi apa yang akan diambil 


  private buildFinalPrompt(question: string, data: any) {
    return `
      INFO SISTEM: Anda adalah asisten AI POS. Gunakan data JSON di bawah untuk menjawab.
      
      DATA BISNIS: ${JSON.stringify(data)}
      Informasi Bisnis :  ${JSON.stringify(BUSINESS_KNOWLEDGE)}
      
      PERTANYAAN USER: "${question}"
      
      INSTRUKSI:
      1. Jawab dengan ramah dan profesional.
      2. Jika user meminta data terstruktur, gunakan format JSON.
      3. Jika data tidak tersedia di konteks, katakan Anda tidak memiliki akses ke data spesifik tersebut.
      4. JANGAN menampilkan JSON mentah kepada pengguna.
      5.  Gunakan format list atau tabel Markdown jika datanya banyak.
      6. Analisalah data di atas untuk menjawab pertanyaan pengguna.
    `;
  }

  async DataReport(q : string) {

    try {
      
      const oId = this.currentOutletId;
      if (!oId) throw new BadRequestException('Outlet ID wajib diisi');
        
      const contextData = await this.sourceLib.gatherContext(new Types.ObjectId(oId), q);
      return {
        status: 'success',
        message: 'Hasil data report untuk ai',
        data: contextData
      }

    } catch (error :any) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Gagal mengambil hasil report untuk ai: ${error}` );
    }
  }

}


  
  // private async gatherContext(oid: Types.ObjectId, question: string) {
  //   const contextData: any = {};
  //   const q = question.toLowerCase();
    
  //   if (q.includes('stok') || q.includes('habis') || q.includes('inventory')) {
  //     contextData.inventory = await this.getLowStockReport(oid);
  //   }
    
  //   if (q.includes('jual') || q.includes('laku') || q.includes('omzet') || q.includes('transaksi')) {
  //     contextData.sales = await this.getSalesSummary(oid);
  //   }

  //   if (q.includes('resep') || q.includes('modal') || q.includes('untung')) {
  //     contextData.recipeAnalysis = await this.getRecipeProfitability(oid);
  //   }

  //   return contextData;
  // }

  // // --- DATA AGGREGATORS ---

  // private async getLowStockReport(outletId: Types.ObjectId) {
  //   return await this.inventoryModel.find({
  //     outlet_id: outletId,
  //     $expr: { $lte: ["$stock", "$min_stock_alert"] },
  //     isDeleted: false
  //   }).select('name sku stock min_stock_alert unit').limit(15).lean();
  // }

  // private async getSalesSummary(outletId: Types.ObjectId) {
  //   return await this.transactionModel.aggregate([
  //     { $match: { outlet_id: outletId, status: 'PAID' } },
  //     { $limit: 100 }, // Batasi data agar token AI tidak bengkak
  //     { $group: { 
  //         _id: null, 
  //         totalRevenue: { $sum: "$total_amount" },
  //         totalTrx: { $sum: 1 },
  //         avgBasket: { $avg: "$total_amount" }
  //     }}
  //   ]);
  // }

  // private async getRecipeProfitability(outletId: Types.ObjectId) {
  //   return await this.productModel.aggregate([
  //     { $match: { outlet_id: outletId, isDeleted: false } },
  //     { $lookup: {
  //         from: 'recipes', // Pastikan nama collection di mongodb benar
  //         localField: '_id',
  //         foreignField: 'product_id',
  //         as: 'recipe'
  //     }},
  //     { $unwind: { path: '$recipe', preserveNullAndEmptyArrays: false } },
  //     { $project: {
  //         name: 1,
  //         price_sell: 1,
  //         price_buy: 1,
  //         profit: { $subtract: ["$price_sell", "$price_buy"] }
  //     }}
  //   ]).limit(10);
  // }