/* eslint-disable max-len */
// src/modules/categories/dto/create-category.dto.ts

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */


import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, ValidateNested, IsArray, IsMongoId  } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaObjectDto } from '../../media/dto/create-media.dto';
import { Types } from 'mongoose';


export class CreateCategoryDto {
  @ApiProperty({ example: 'Makanan Berat' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '658a888...' })
  @IsOptional()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  outlet_id!: string;

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

  @ApiProperty({ example: 'FOD', required: false })
  @IsString()
  @IsOptional()
  ref_code?: string;

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