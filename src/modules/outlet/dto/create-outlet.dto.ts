/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/outlet/dto/create-outlet.dto.ts
/* eslint-disable max-len */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { MediaObjectDto } from '../../media/dto/create-media.dto';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng!: number;

  @IsString()
  @IsOptional()
  link!: string;
}



export class CreateOutletDto {
    
  @ApiProperty({ example: 'TKO-JKT01', description: 'Code Toko' })
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsNumber()
  @IsOptional()
  phone?: number;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  @IsObject() 
  location?: LocationDto;

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


  @ApiProperty({ example: 'true' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

}