/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-len */
// src/main.ts
// 1. PINDAHKAN KE PALING ATAS
import 'module-alias/register'; 

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';

// Simpan instance server agar tidak bootstrap ulang setiap request (Cold Start Optimization)
let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: true, // Untuk testing di Vercel, set true dulu
      credentials: true,
    });

    app.setGlobalPrefix('api/v1');
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));

    // Swagger (Hanya muncul jika bukan production atau sesuai kebutuhan)
    const config = new DocumentBuilder()
      .setTitle('NextKasir Pro API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.init(); // PENTING: Inisialisasi tanpa listen()
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

// 2. EXPORT UNTUK VERCEL
export default async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

// 3. JALANKAN LISTEN HANYA JIKA DI LOKAL
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(() => {
    const port = process.env.PORT || 5010;
    // Karena bootstrap sekarang return server instance, 
    // kamu bisa modifikasi sedikit jika ingin tetap melihat log listen di lokal.
    console.log(`🚀 Local Server running on http://localhost:${port}`);
  });
}