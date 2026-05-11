/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CACHE') private redis: any) {}

  // --- 1. LOGIKA CACHE (JAWABAN INSTAN) ---

  /**
   * Mengambil cache jawaban berdasarkan hash pertanyaan
   */
  async getCache(tId: string, oId: string, question: string): Promise<string | null> {
    const hash = crypto.createHash('md5').update(question.toLowerCase().trim()).digest('hex');
    const cacheKey = `ai_cache:${tId}:${oId}:${hash}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        console.log(`🎯 Redis Hit: ${cacheKey}`);
      }
      return cached;
    } catch (err : any) {
      return null;
    }
  }

  /**
   * Menyimpan jawaban ke cache dengan debugging log
   */
  async setCache(tId: string, oId: string, question: string, response: string) {
    const hash = crypto.createHash('md5').update(question.toLowerCase().trim()).digest('hex');
    const cacheKey = `ai_cache:${tId}:${oId}:${hash}`;

    try {
      await this.redis.set(cacheKey, response, 300000); // TTL 5 Menit

      // Debugging untuk memastikan data masuk ke Cloud, bukan RAM
      const activeStores = (this.redis as any).stores;
      const isRedis = activeStores && activeStores[0]?.client;

      if (isRedis) {
        console.log(`🟢 Saved to Redis Cloud: ${cacheKey}`);
      } else {
        console.warn(`🔴 Warning: Saved to RAM (Memory), Check Connection!`);
      }
    } catch (err: any) {
      console.error('❌ Redis Cache Error:', err.message);
    }
  }

  // --- 2. LOGIKA HISTORY (INGATAN CHAT) ---

  /**
   * Menambahkan pesan baru ke riwayat chat
   */
  async appendHistory(tId: string, oId: string, role: 'user' | 'model', text: string) {
    const key = `${tId}:${oId}`;
    const fullKey = `history:${key}`;
    const history = await this.getHistory(tId, oId);
    
    history.push({
      role,
      parts: [{ text }]
    });

    // Batasi history (10 pesan terakhir)
    const limitedHistory = history.slice(-10);

    // Simpan ke Redis (TTL 30 menit)
    await this.redis.set(fullKey, JSON.stringify(limitedHistory), 1800000);
  }

  /**
   * Mengambil riwayat percakapan
   */
  async getHistory(tId: string, oId: string): Promise<ChatMessage[]> {
    const key = `${tId}:${oId}`;
    const fullKey = `history:${key}`;
    const data = await this.redis.get(fullKey);
    
    if (!data) return [];
    
    // Jika data berupa string (karena JSON.stringify), kita parse
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  /**
   * Reset percakapan
   */
  async clearHistory(tId: string, oId: string) {
    await this.redis.del(`history:${tId}:${oId}`);
  }
}