/* eslint-disable max-len */
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsEmail, 
  IsOptional, 
  Matches, 
  ValidateNested,
  IsEnum,
  IsDate,
  MinLength,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaObjectDto } from '../../media/dto/create-media.dto';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Kopi Kenangan Luar Biasa', description: 'Nama Brand/Perusahaan' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ 
    example: 'kopi-kenangan', 
    description: 'ID unik untuk database (lowercase & hyphen direkomendasikan untuk subdomain)' 
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9_]+$/, { 
    message: 'tenant_id hanya boleh huruf kecil, angka, dan tanda hubung (-)' 
  })
  tenant_id!: string;

  @IsOptional() // <-- Tambahkan ini agar tidak error saat request awal dari Postman
  @IsString()
  @Matches(/^[a-z0-9]+$/, { // Hapus underscore jika suffix hanya angka & huruf
    message: 'tenant_suffix hanya boleh huruf kecil dan angka' 
  })
  tenant_suffix?: string;

  @ApiProperty({ example: 'owner@kopikenangan.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'kopikenangan' })
  @IsString()
  @IsNotEmpty()
  outlet_name!: string;

  @ApiProperty({ 
    example: 'p4ssword_rahasia', 
    description: 'Password awal untuk login owner di POS/CMS' 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string; // 👈 Tambahan wajib untuk Provisioning

  @ApiProperty({ example: 'Andi Herlambang' })
  @IsString()
  @IsNotEmpty()
  owner_name!: string;

  @ApiProperty({ example: "021323" })
  @IsNumber()
  phone!: number;
  
  @ApiProperty({ example: 'F&B' })
  @IsString()
  @IsOptional()
  business_type?: string;

  @ApiProperty({ type: MediaObjectDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MediaObjectDto)
  logo?: MediaObjectDto;

  @ApiProperty({ 
    example: 'BASIC', 
    enum: ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'],
    default: 'TRIAL' 
  })
  @IsEnum(['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE'])
  @IsNotEmpty()
  subscription_plan!: string;

  @ApiProperty({ 
    example: '2026-12-31T00:00:00.000Z', 
    description: 'Tanggal kedaluwarsa langganan' 
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expired_at!: Date;
}