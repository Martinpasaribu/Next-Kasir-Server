/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/agent-assistant/strategies/gemini.strategy.ts
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';

@Injectable()
export class GeminiStrategy {
  readonly name = 'gemini';
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  /**
   * @param data - Konteks data dari DB (stok, transaksi, dll)
   * @param prompt - Instruksi + pertanyaan user saat ini
   * @param history - Array percakapan sebelumnya dari Redis
   */
  async analyze(data: any, prompt: string, history: Content[] = []): Promise<string> {
    const isJsonRequested = prompt.toLowerCase().includes('json');

    try {
      // 1. Inisialisasi model (Gunakan versi stabil agar tidak sering 404)
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview" 
        // model: "gemini-2.5-flash-lite" 
        // model: "gemini-2.5-flash" 
        // model: "gemini-1.5-flash" 
        // model: "gemini-2.0-flash-lite" 
      });

      // 2. Gunakan startChat untuk menyertakan history percakapan
      // Ini yang membuat Gemini "ingat" konteks sebelumnya
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 2000, // Sesuaikan dengan kebutuhan
          temperature: 0.7,
        },
      });

      // 3. Kirim pesan baru ke dalam sesi chat yang sudah ada history-nya
      const result = await chat.sendMessage(prompt);
      const response = result.response;
      let text = response.text();

      // 4. Bersihkan manual markdown jika user minta JSON
      if (isJsonRequested) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return text;
    } catch (error: any) {
      console.error("Gemini Strategy Error:", error.message);
      
      // Fallback sederhana jika terjadi error pada model tertentu
      if (error.message.includes('404')) {
         const fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
         const res = await fallbackModel.generateContent(prompt);
         return res.response.text();
      }
      
      throw error;
    }
  }
}