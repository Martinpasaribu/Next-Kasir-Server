
// src/modules/auth/dto/login.dto.ts

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, ValidateNested } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}