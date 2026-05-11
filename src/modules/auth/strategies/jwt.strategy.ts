/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */

// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ambil token dari Header Bearer atau sesuaikan jika Anda pakai Cookie
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'YOUR_SECRET_KEY', 
    });
  }

  async validate(payload: any) {
    // Data ini akan masuk ke req.user
    // Sesuaikan dengan isi payload saat Anda melakukan sign di AuthService
    if (!payload) {
      throw new UnauthorizedException();
    }
    
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role,
      tenantId: payload.tenantId 
    };
  }
}