// src/agent-assistant/strategies/grok.strategy.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai'; // Grok menggunakan SDK OpenAI

@Injectable()
export class GrokStrategy {
  readonly name = 'grok';
  private grok: OpenAI;

  constructor() {
    this.grok = new OpenAI({
      apiKey: process.env.GROK_API_KEY!,
      baseURL: "https://api.x.ai/v1", // Ini yang mengarahkan SDK ke server Grok
    });
  }

  async analyze(data: any, prompt: string): Promise<string> {
    const isJsonRequested = prompt.toLowerCase().includes('json');

    const response = await this.grok.chat.completions.create({
      model: "grok-beta", // Sesuaikan dengan model terbaru xAI
      messages: [
        { 
          role: "system", 
          content: "Anda adalah asisten cerdas untuk sistem kasir POS." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: isJsonRequested ? 0.1 : 0.7,
      // Pola yang sama dengan Gemini & Claude
      response_format: isJsonRequested ? { type: "json_object" } : { type: "text" },
    });

    return response.choices[0].message.content || "";
  }
}