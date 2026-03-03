/* eslint-disable max-len */
// src/modules/products/dto/create-product.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaObjectDto } from '../../media/dto/create-media.dto';

export class CreateProductDto {
  @ApiProperty({ example: '658a99988877766655544433', description: 'ID Kategori' })
  @IsMongoId()
  @IsNotEmpty()
  category_key!: string;

  @ApiProperty({ example: 'Nasi Goreng Spesial' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PROD-001', description: 'SKU atau Barcode' })
  @IsString()
  // @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: 15000, description: 'Harga Modal' })
  @IsNumber()
  @IsNotEmpty()
  price_buy!: number;

  @ApiProperty({ example: 25000, description: 'Harga Jual' })
  @IsNumber()
  @IsNotEmpty()
  price_sell!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  stock?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  min_stock_alert?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'pcs' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 'pcs' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'pcs' })
  @IsString()
  @IsOptional()
  sub_description?: string;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsOptional()
  recommend?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ type: MediaObjectDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaObjectDto)
  icon?: MediaObjectDto;

  @ApiProperty({ type: MediaObjectDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaObjectDto)
  image_bg?: MediaObjectDto;

  @ApiProperty({ type: [MediaObjectDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaObjectDto)
  images?: MediaObjectDto[];

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}