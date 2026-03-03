/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/modules/auth/auth.service.ts

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Connection, Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { MerchantUser, MerchantUserSchema } from './schemas/merchant-user.schema';

@Injectable()
export class AuthService {
  private merchantUserModel: Model<MerchantUser>;

  constructor(
    @Inject('TENANT_CONNECTION') private tenantConn: Connection, // Untuk Kasir (Dynamic)
    @InjectConnection() private masterConn: Connection,           // Untuk Admin Pusat (Static)
    private jwtService: JwtService,
  ) {
    // Inisialisasi model Merchant secara dinamis
    if (this.tenantConn) {
      this.merchantUserModel = this.tenantConn.model(MerchantUser.name, MerchantUserSchema);
    }
  }

  // LOGIN UNTUK ADMIN PUSAT (SUPERADMIN, ADMIN, CO_ADMIN)
  async loginAdmin(dto: any, res: Response) {
    const adminModel = this.masterConn.model(AdminUser.name, AdminUserSchema);
    const admin = await adminModel.findOne({ email: dto.email }).select('+password');

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Kredensial Admin Pusat salah');
    }

    return this.createSession(res, {
      sub: admin._id,
      role: admin.role,
      type: 'SYSTEM',
    });
  }

  // LOGIN UNTUK MERCHANT/KASIR (OWNER, MANAGER, CASHIER)
  async loginMerchant(dto: any, tenantId: string, res: Response) {
    // Pastikan model merchant terikat ke koneksi tenant yang benar
    const merchantModel = this.tenantConn.model(MerchantUser.name, MerchantUserSchema);
    const user = await merchantModel.findOne({ username: dto.username }).select('+password');

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Kredensial Toko salah');
    }

    return this.createSession(res, {
      sub: user._id,
      role: user.role,
      tenantId: tenantId,
      type: 'MERCHANT',
    });
  }

  private createSession(res: Response, payload: any) {
    const token = this.jwtService.sign(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      role: payload.role,
      type: payload.type,
      tenantId: payload.tenantId || null
    });
  }
}