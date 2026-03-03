/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Res, Headers, Req, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ApiTags, ApiHeader, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Login untuk tim internal (Superadmin/Admin)' })
  async loginAdmin(@Body() dto: any, @Res() res: Response) {
    return this.authService.loginAdmin(dto, res);
  }

  @Post('merchant/login')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiOperation({ summary: 'Login untuk klien/toko (Owner/Manager/Cashier)' })
  async loginMerchant(
    @Body() dto: any,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response
  ) {
    return this.authService.loginMerchant(dto, tenantId, res);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({ message: 'Logout berhasil' });
  }
}