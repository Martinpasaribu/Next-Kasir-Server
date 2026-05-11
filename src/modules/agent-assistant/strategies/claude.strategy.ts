// src/agent-assistant/strategies/claude.strategy.ts
import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeStrategy {
  readonly name = 'claude';
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });
  }

  async analyze(data: any, prompt: string): Promise<string> {
    const isJsonRequested = prompt.toLowerCase().includes('json');

    const response = await this.anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      temperature: isJsonRequested ? 0 : 0.7,
      // Claude tidak butuh MimeType eksplisit, dia mengikuti instruksi prompt
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock && 'text' in textBlock ? textBlock.text : "";
  }
}