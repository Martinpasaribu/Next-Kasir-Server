/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module, Global } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { createCache } from 'cache-manager';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CACHE',
      useFactory: async () => {
        try {
          const store = await redisStore({
            socket: {
              host: process.env.REDIS_HOST,
              port: parseInt(process.env.REDIS_PORT || '6379'),
              tls: process.env.REDIS_TLS === 'true',
            },
            password: process.env.REDIS_PASSWORD,
          });

          console.log('🚀 Redis Core: Connected to Cloud');

          // DI SINI PERUBAHANNYA:
          // Gunakan 'stores' (array) dan bukan 'store'
            return createCache({
              stores: [store],
            } as any)
        } catch (error :any) {
          console.error('❌ Redis Core: Connection Failed!', error.message);
          return null; 
        }
      },
    },
    RedisService
  ],
  exports: ['REDIS_CACHE', RedisService],
})
export class RedisModule {}