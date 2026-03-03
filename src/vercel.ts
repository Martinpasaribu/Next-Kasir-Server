/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

// Caching instance untuk optimasi Cold Start
let cachedServer: any;

export default async (req: any, res: any) => {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);

    // 1. Konfigurasi Dasar (Sama dengan main.ts)
    app.enableCors({
      origin: true, // Di Vercel sebaiknya dinamis atau whitelist production URL
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    // 2. Validation Pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));

    // PENTING: Jangan panggil app.listen()
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer(req, res);
};