/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-len */
// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { json, urlencoded } from 'express';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import cookieParser from 'cookie-parser';

import 'module-alias/register';


async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS Configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'https://your-pos-app.com'],
    credentials: true,
  });

  // 2. Global Prefix & Limit
  app.setGlobalPrefix('api/v1');
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());
  //  app.use(new RateLimitMiddleware().use);

  // 3. Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // INI KUNCINYA
      transformOptions: {
        enableImplicitConversion: true, // Tambahkan ini juga
      },  
  }));

  // 4. Swagger Setup (Pro POS Style)
  const config = new DocumentBuilder()
    .setTitle('NextKasir Pro API')
    .setDescription('Multi-tenant POS System API Documentation')
    .setVersion('1.0')
    .addBearerAuth() // Untuk JWT
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id') // Untuk Tenant ID
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 5. MongoDB Connection Watcher
  mongoose.connection.on('connected', () => logger.log('✅ Master DB Connected'));
  mongoose.connection.on('error', (err) => logger.error(`❌ DB Error: ${err}`));

  const port = process.env.PORT || 5003;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger docs available at http://localhost:${port}/api-docs`);
}

bootstrap();