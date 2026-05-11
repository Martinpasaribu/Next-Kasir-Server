// src/modules/auth/dto/create-merchant-user.dto.ts
import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MinLength, 
  IsArray,
  IsMongoId,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { UserPermissionsDto } from './user-permissions.dto';
import { Type } from 'class-transformer';

export class CreateMerchantUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap harus diisi' })
  full_name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Username harus diisi' })
  @MinLength(4, { message: 'Username minimal 4 karakter' })
  username!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email harus diisi' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password harus diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;

  @IsEnum(['OWNER', 'MANAGER', 'ASSISTANT', 'CASHIER'], {
    message: 'Role harus salah satu dari: OWNER, MANAGER, ASSISTANT, atau CASHIER',
  })
  @IsOptional()
  role?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  accessible_outlets?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  avatar?: any; // Anda bisa memperketat ini jika MediaObject sudah ada DTO-nya

  // Integrasi Hak Akses Menu
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  permissions?: UserPermissionsDto;
}