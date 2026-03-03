/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
// src/app.module.ts
import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// Core & Database
import { DatabaseModule } from './core/database/database.module';
import { TenantModule } from './core/tenant/tenant.module';

// Fitur Modules
import { BusinessModule } from './modules/business/business.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OutletModule } from './modules/outlet/outlet.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Multi-tenant Core
    DatabaseModule, // Ini yang menghandle MongooseModule.forRootAsync (Master)
    TenantModule,   // Ini yang menghandle validasi tenant

    // Operational Modules
    AuthModule,
    BusinessModule,
    OutletModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    TransactionsModule,
    MediaModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  private readonly logger = new Logger('AppStatus');

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onApplicationBootstrap() {
    // Memberikan info database master yang terhubung saat start
    if (this.connection.readyState === 1) {
      this.logger.log(`⭐ Master DB: ${this.connection.name} [READY]`);
    }
  }
}