/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/inventory/dto/create-stock-log.dto.ts
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, ValidateNested, IsMongoId, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateStockLogDto {
  @IsMongoId()
  product_id!: string;

  @ApiProperty({ example: '658a123abc...' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  outlet_id!: Types.ObjectId;

  @IsEnum(['IN', 'OUT', 'ADJUSTMENT'])
  type!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}