/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/modules/transactions/dto/create-transaction.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, 
  ValidateNested, IsMongoId, IsEnum 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';


class CustomerDataDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  address?: string;
}

class DiscountDto {
  @IsOptional()
  @IsMongoId()
  promo_id?: string;

  @IsEnum(['percentage', 'fixed'])
  type!: string;

  @IsNumber()
  nominal!: number;
}

class PaymentDto {
  @IsString()
  @IsNotEmpty()
  type!: string; // 'cash', 'qris', dll

  @IsString()
  @IsNotEmpty()
  label!: string; // 'Tunai', 'BCA QRIS'

  @IsNumber()
  price!: number; // Nominal yang dibayar

  @IsNumber()
  @IsOptional()
  change?: number;

  @IsString()
  @IsOptional()
  provider_name?: string;


  // ... tambahkan field lain seperti bill_key jika diperlukan dari kasir
}

class TransactionItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  price!: number;

  @IsNumber()
  @IsOptional()
  discount_item?: number;

  @IsNumber()
  qty!: number;

  @IsNumber()
  subtotal!: number;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'TRX-1312313' })
  @IsString()
  @IsOptional()
  trx_id!: string;

  // @IsMongoId()
  // @IsNotEmpty()
  // outlet_id!: string;

  @ApiProperty({ example: '658a123abc...' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  outlet_id!: Types.ObjectId;

  @ApiProperty({ example: '658a123abc...' })
  @IsOptional()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  customer_key?: Types.ObjectId;

  
  @IsOptional()
  customer_data?:CustomerDataDto;

  @ApiProperty({ example: '658a123abc...' })
  @IsOptional()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  cashier_key!: Types.ObjectId;

  @ApiProperty({ example: '658a123abc...' })
  @IsOptional()
  @Transform(({ value }) => {
    if (Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    return value; 
  })
  created_by?: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  product_key!: TransactionItemDto[]; // Sesuai nama di Schema

  @IsNumber()
  down_payment!: number;

  @IsNumber()
  sub_amount!: number;

  @IsNumber()
  total_amount!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;

  @IsNumber()
  @IsOptional()
  tax_amount?: number;

  @IsNumber()
  @IsOptional()
  shippingFee: number = 0;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  syncStatus?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentDto)
  payments!: PaymentDto[]; // Sesuai nama di Schema (Array)

  @IsEnum(['PAID', 'CANCELLED', 'REFUND', 'PARTIAL','PENDING'])
  @IsOptional()
  status?: string;
}