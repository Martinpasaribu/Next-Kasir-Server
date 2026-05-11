/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { MerchantUser, MerchantUserSchema } from '../merchant-user/schemas/merchant-user.schema';
import { Outlet, OutletSchema } from '../outlet/schemas/outlet.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject('TENANT_CONNECTION') private tenantConn: Connection, // Koneksi Dinamis (Toko)
    @InjectConnection() private masterConn: Connection,           // Koneksi Statis (Pusat)
    private jwtService: JwtService,
  ) {}

  /**
   * Helper: Mengambil model secara aman.
   * Mencegah "OverwriteModelError" jika model sudah terdaftar di koneksi tersebut.
   */
  private getModelFromConn<T>(conn: Connection, name: string, schema: any) {
    return conn.models[name] || conn.model(name, schema);
  }

  // 1. LOGIN ADMIN PUSAT (Untuk center.nextkasir.pro)
  async loginAdmin(dto: any, res: Response) {
    const adminModel = this.getModelFromConn(this.masterConn, AdminUser.name, AdminUserSchema);
    const admin = await adminModel.findOne({ email: dto.email }).select('+password');

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Kredensial Admin Pusat salah');
    }

    return this.createSession(res, {
      sub: admin._id,
      role: admin.role,
      type: 'SYSTEM', // Penanda akses ke Central System
    });
  }


  async loginMerchantAdmin(dto: any, tenantId: string, res: any) {
    // 1. Pastikan koneksi tenant tersedia
    if (!this.tenantConn) {
      throw new UnauthorizedException('Tenant database connection failed');
    }

    this.getModelFromConn(this.tenantConn, Outlet.name, OutletSchema);
    
    // 2. Inisialisasi Model (Pastikan menunjuk ke collection 'users')
    const MerchantModel = this.tenantConn.models[MerchantUser.name] || 
                          this.tenantConn.model(MerchantUser.name, MerchantUserSchema, 'users');

    // 3. Cari user & Sertakan field password untuk validasi
    // TAMBAHKAN .populate('accessible_outlets') agar data outlet ikut terambil
    const user = await MerchantModel.findOne({ email: dto.email })
      .select('+password')
      .populate({
        path: 'accessible_outlets',
        select: 'name code icon address isActive', // Ambil field yang diperlukan saja
        match: { isDeleted: false, isActive: true } // Hanya ambil outlet yang aktif
      });

    if (!user) {
      throw new UnauthorizedException(`User ${dto.email} tidak terdaftar di Bisnis: ${this.tenantConn.name}`);
    }

    // 4. Validasi Password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    // 5. Generate JWT Token khusus Tenant
    const payload = { 
      sub: user._id, 
      email: user.email, 
      role: user.role, 
      tenantId: `${tenantId}`,
      user_outlet: user.accessible_outlets || [], // Sertakan daftar outlet yang bisa diakses user
      type: 'MERCHANT' 
    };

    const token = this.jwtService.sign(payload);

    // 6. Response JSON
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      access_token: token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        tenant_id: `${tenantId}`,
        // KIRIM DAFTAR OUTLET KE FRONTEND
        outlets: user.accessible_outlets || [] 
      }
    });
  }

  async loginMerchantCashier(dto: any, tenantId: string, res: any) {
    // 1. Pastikan koneksi tenant tersedia
    if (!this.tenantConn) {
      throw new UnauthorizedException('Tenant database connection failed');
    }

    this.getModelFromConn(this.tenantConn, Outlet.name, OutletSchema);
    
    // 2. Inisialisasi Model (Pastikan menunjuk ke collection 'users')
    const MerchantModel = this.tenantConn.models[MerchantUser.name] || 
                          this.tenantConn.model(MerchantUser.name, MerchantUserSchema, 'users');

    // 3. Cari user & Sertakan field password untuk validasi
    // TAMBAHKAN .populate('accessible_outlets') agar data outlet ikut terambil
    const user = await MerchantModel.findOne({ email: dto.email })
      .select('+password')
      .populate({
        path: 'accessible_outlets',
        select: 'name code icon address isActive', // Ambil field yang diperlukan saja
        match: { isDeleted: false, isActive: true } // Hanya ambil outlet yang aktif
      });

    if (!user) {
      throw new UnauthorizedException(`User ${dto.email} tidak terdaftar di Bisnis: ${this.tenantConn.name}`);
    }

    // 4. Validasi Password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    // 5. Generate JWT Token khusus Tenant
    const payload = { 
      sub: user._id, 
      email: user.email, 
      role: user.role, 
      tenantId: `${tenantId}`,
      user_outlet: user.accessible_outlets || [], // Sertakan daftar outlet yang bisa diakses user
      type: 'MERCHANT' 
    };

    const token = this.jwtService.sign(payload);

    // 6. Response JSON
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      access_token: token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        tenant_id: `${tenantId}`,
        // KIRIM DAFTAR OUTLET KE FRONTEND
        outlets: user.accessible_outlets || [] 
      }
    });
  }
  
  private createSession(res: Response, payload: any) {
    const token = this.jwtService.sign(payload);

    // Kirim cookie untuk keamanan (HTTPOnly)
    // res.cookie('access_token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    res.cookie('auth_token', token, {
      httpOnly: true, // JAVASCRIPT TIDAK BISA BACA (Anti XSS)
      secure: process.env.NODE_ENV === 'production', // Hanya lewat HTTPS
      sameSite: 'strict', // Mencegah CSRF
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 // 1 hari
    });

    // Kirim juga token di Body agar Nuxt useCookie bisa membacanya dengan mudah
    return res.status(200).json({
      success: true,
      token: token, 
      role: payload.role,
      type: payload.type,
      tenantId: payload.tenantId || null
    });
  }


  /**
   * Mengambil profile user dari database tenant yang aktif
   */
  async getMerchantProfile(userId: string, tenantId: string) {
    // 1. Pastikan koneksi tenant tersedia (Injected via middleware/provider)
    if (!this.tenantConn) {
      throw new UnauthorizedException('Koneksi database merchant tidak ditemukan');
    }

    // 2. Pastikan model Outlet terdaftar (untuk populate)
    this.getModelFromConn(this.tenantConn, Outlet.name, OutletSchema);

    // 3. Inisialisasi Model MerchantUser pada koneksi tenant
    const MerchantModel = this.tenantConn.models[MerchantUser.name] || 
                          this.tenantConn.model(MerchantUser.name, MerchantUserSchema, 'users');

    // 4. Cari user berdasarkan ID dari payload JWT
    const user = await MerchantModel.findById(userId)
      .populate({
        path: 'accessible_outlets',
        select: 'name code icon address isActive',
        match: { isDeleted: false, isActive: true }
      })
      .lean(); // Menggunakan lean untuk performa karena hanya read-only

    if (!user) {
      throw new BadRequestException(`Data profil ${userId} tidak ditemukan di database merchant ini`);
    }

    // 5. Kembalikan data yang bersih (tanpa password)
    return {
      success: true,
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        tenant_id: tenantId,
        outlets: user.accessible_outlets || [],
        avatar: user.avatar || null, // Jika ada field avatar di schema
        createdAt: user.createdAt
      }
    };
  }

  
}