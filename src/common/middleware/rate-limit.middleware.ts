import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; lastRequestTime: number }>();
const TIME_WINDOW = 60 * 1000; // 60 detik
const MAX_REQUESTS = 10;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip ?? req.connection.remoteAddress ?? 'unknown';
    const currentTime = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, lastRequestTime: currentTime };

    if (currentTime - record.lastRequestTime > TIME_WINDOW) {
      // reset rate limit
      rateLimitMap.set(ip, { count: 1, lastRequestTime: currentTime });
      next();
    } else {
      if (record.count >= MAX_REQUESTS) {
        throw new BadRequestException('Terlalu banyak permintaan. Coba lagi nanti.');
      } else {
        rateLimitMap.set(ip, {
          count: record.count + 1,
          lastRequestTime: record.lastRequestTime,
        });
        next();
      }
    }
  }
}
