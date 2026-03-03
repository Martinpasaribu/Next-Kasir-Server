/* eslint-disable max-len */
// src/modules/categories/dto/create-category.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, ValidateNested, IsArray  } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaObjectDto } from 'src/modules/media/dto/create-media.dto';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Makanan Berat' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'minuman-keras', required: false  })
  @IsString()
  slug!: string;

  @ApiProperty({ example: 'Kategori untuk semua nasi dan lauk', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Kategori untuk semua nasi dan lauk', required: false })
  @IsString()
  @IsOptional()
  sub_description?: string;

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

  @ApiProperty({ example: 0, description: 'Urutan tampilan di kasir' })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  recommend?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}