// src/agent-assistant/dto/analysis-request.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class AnalysisRequestDto {
  @IsNotEmpty({ message: 'Pertanyaan tidak boleh kosong' })
  @IsString()
  question!: string; // User bertanya: "Berapa stok ayam saat ini?"

  // @IsNotEmpty({ message: 'Outlet ID diperlukan untuk konteks data' })
  // @IsString()
  // outlet_id!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Task sekarang bersifat opsional karena AI bisa mendeteksi task dari kalimat 'question'
  @IsOptional()
  @IsString()
  task?: 'sales_summary' | 'inventory_alert' | 'debt_analysis' | 'employee_performance';
}