/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */

// src/agent-assistant/agent-assistant.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AgentAssistantService } from './agent-assistant.service';
import { AnalysisRequestDto } from './dto/analysis-request.dto';

@Controller('agent-assistant')
export class AgentAssistantController {
  constructor(private readonly assistantService: AgentAssistantService) {}

  @Post('chat')
  async chat(@Body() body: AnalysisRequestDto) {
    // Kita hanya ambil question dan outlet_id dari user
    const { question } = body;

    const result = await this.assistantService.ask(
      question
    );

    return {
      success: true,
      data: this.tryParseJson(result)
    };
  }

  private tryParseJson(text: string) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  @Get('cek-report')
    async CekResource(@Body() body: any) {
    const { question } = body;
    return await this.assistantService.DataReport(question);
  }
}