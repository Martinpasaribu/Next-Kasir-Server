/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class MediaObjectDto {
  @ApiProperty({ 
    example: 'https://ik.imagekit.io/yourid/image.jpg',
    description: 'URL file dari ImageKit' 
  })
  @IsString()
  // @IsNotEmpty() 
  url!: string;

  @ApiProperty({ 
    example: 'file_id_123',
    description: 'ID file dari ImageKit' 
  })
  @IsString()
  // @IsNotEmpty() 
  fileId!: string;

  @ApiProperty({ 
    example: 'image', 
    default: 'image',
    required: false 
  })
  
  @IsString()
  @IsOptional() // Opsional di DTO, karena di Schema ada default: 'image'
  fileType?: string;

  // ✅ Tambahkan ini untuk menampung field dari respons upload
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fieldName?: string;
}