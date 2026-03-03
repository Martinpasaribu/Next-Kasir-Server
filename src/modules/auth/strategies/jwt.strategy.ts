/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.access_token || null,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Data ini akan tersedia di req.user
    return {
      userId: payload.sub,
      role: payload.role,
      tenantId: payload.tenantId,
      type: payload.type // 'SYSTEM' atau 'MERCHANT'
    };
  }
}