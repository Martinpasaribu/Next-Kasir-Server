/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    // Tambahkan check ini untuk debugging di log Vercel
    if (!secret) {
      console.error('❌ FATAL: JWT_SECRET is not defined in environment variables!');
    }

    super({
      // Jika pakai cookie:
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      },
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      role: payload.role,
      tenantId: payload.tenantId,
      type: payload.type 
    };
  }
}