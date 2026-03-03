// src/modules/business/dto/create-business.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  Matches, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaObjectDto } from 'src/modules/media/dto/create-media.dto';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Kopi Kenangan Luar Biasa', description: 'Nama Brand/Perusahaan' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ 
    example: 'kopi_kenangan', 
    description: 'ID unik untuk database tenant (lowercase & underscore)' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/, { 
    message: 'tenant_id hanya boleh huruf kecil, angka, dan underscore' 
  })
  tenant_id!: string;

  @ApiProperty({ example: 'owner@kopikenangan.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Andi Herlambang' })
  @IsString()
  @IsNotEmpty()
  owner_name!: string;

  @ApiProperty({ example: '08123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ type: MediaObjectDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaObjectDto)
  logo?: MediaObjectDto;

  @ApiProperty({ example: 'BASIC', enum: ['TRIAL', 'BASIC', 'PRO'] })
  @IsString()
  @IsOptional()
  subscription_plan?: string;
}