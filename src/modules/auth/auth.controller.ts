/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Res, Headers, BadRequestException, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { ApiTags, ApiHeader, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from './guards/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Login Center NextKasir (Superadmin/Admin)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        email: { type: 'string', example: 'superadmin@nextkasir.pro' },
        password: { type: 'string', example: 'password123' }
      } 
    } 
  })
  async loginAdmin(@Body() dto: any, @Res() res: Response) {
    return this.authService.loginAdmin(dto, res);
  }

  // LOGIN POS ADMIN
  @Post('merchant-admin/login')
  @ApiHeader({ 
    name: 'x-tenant-id', 
    required: true, 
    description: 'Subdomain toko tanpa domain utama (contoh: mobil-berkah)' 
  })
  @ApiOperation({ summary: 'Login POS & CMS Merchant (Owner/Manager/Cashier)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        email: { type: 'string', example: 'admin@mobilberkah.com' }, // Pastikan pakai email jika di service pakai email
        password: { type: 'string', example: 'keycode123' }
      } 
    } 
  })
  async loginMerchantAdmin(
    @Body() dto: any,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response
  ) {
    // Validasi tambahan di level controller sebelum masuk ke service
    if (!tenantId) {
      throw new BadRequestException('Header x-tenant-id tidak ditemukan. Pastikan Anda mengakses via subdomain toko.');
    }
    
    return this.authService.loginMerchantAdmin(dto, tenantId, res);
  }

  // LOGIN POS CASHIER
  @Post('merchant-cashier/login')
  @ApiHeader({ 
    name: 'x-tenant-id', 
    required: true, 
    description: 'Subdomain toko tanpa domain utama (contoh: mobil-berkah)' 
  })
  @ApiOperation({ summary: 'Login POS & CMS Merchant (Owner/Manager/Cashier)' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        email: { type: 'string', example: 'admin@mobilberkah.com' }, // Pastikan pakai email jika di service pakai email
        password: { type: 'string', example: 'keycode123' }
      } 
    } 
  })
  async loginMerchantCashier(
    @Body() dto: any,
    @Headers('x-tenant-id') tenantId: string,
    @Res() res: Response
  ) {
    // Validasi tambahan di level controller sebelum masuk ke service
    if (!tenantId) {
      throw new BadRequestException('Header x-tenant-id tidak ditemukan. Pastikan Anda mengakses via subdomain toko.');
    }
    
    return this.authService.loginMerchantCashier(dto, tenantId, res);
  }


  @Post('logout')
  @ApiOperation({ summary: 'Hapus sesi login' })
  async logout(@Res() res: Response) {
    // Hapus cookie di server-side
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
    });
    
    return res.status(200).json({ 
      success: true,
      message: 'Terminal_Access_Revoked: Session cleared.' 
    });
  }


 @Get('merchant/profile')
  @UseGuards(JwtAuthGuard, RolesGuard) // <-- TAMBAHKAN RolesGuard DI SINI
  @Roles('MERCHANT', 'OWNER', 'MANAGER', 'CASHIER')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiOperation({ summary: 'Ambil profil user merchant yang sedang login' })
  async getProfile(
    @Req() req: any,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID diperlukan untuk mengakses profile.');
    }
    
    // Jika RolesGuard sudah dipasang, console.log di bawah ini 
    // tidak akan terpanggil jika user-nya CASHIER (akan langsung 403 Forbidden)
    console.log('User Payload:', req.user); 
    
    const userId = req.user?.id || req.user?.sub;
    return this.authService.getMerchantProfile(userId, tenantId);
  }
  
}