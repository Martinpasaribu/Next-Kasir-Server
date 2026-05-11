/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
// src/app.module.ts
import { Module, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Core & Database
// import { DatabaseModule } from './core/database/database.module';
import { TenantModule } from './core/tenant/tenant.module';

// Fitur Modules
import { BusinessModule } from './modules/business/business.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OutletModule } from './modules/outlet/outlet.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { MediaModule } from './modules/media/media.module';
import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './modules/customer/customer.module';
import { MerchantUserModule } from './modules/merchant-user/merchant-user.module';
import { MerchantCustomerModule } from './modules/merchant-customer/merchant-customer.module';
import { MerchantOverviewModule } from './modules/merchant-overview/merchant-overview.module';
import { MerchantInventoryModule } from './modules/merchant-inventory/merchant-inventory.module';
import { MerchantSupplierModule } from './modules/merchant-supplier/merchant-supplier.module';
import { MerchantLogModule } from './modules/merchant-log/merchant-log.module';
import { AgentAssistantModule } from './modules/agent-assistant/agent-assistant.module';
import { RedisModule } from './core/config/redis/redis.module';
import { MerchantSettingsModule } from './modules/merchant-settings/merchant-settings.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot(
      { isGlobal: true,  
        cache: true,
        ignoreEnvFile: process.env.NODE_ENV === 'production',
       }
    ),

/**
     * 2. KONEKSI INDUK (MASTER DB)
     * Pindahkan dari DatabaseModule ke sini agar lebih transparan.
     * Ini adalah "Kabel Utama" ke Atlas.
     */
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MASTER_DB_URI'),
      }),
      inject: [ConfigService],
    }),

    /**
     * 3. MULTI-TENANT CORE
     * TenantModule sekarang akan mengambil koneksi dari forRoot di atas
     * dan melakukan .useDb() secara efisien.
     */
    TenantModule,
    RedisModule,
    
    // Operational Modules
    AuthModule,
    BusinessModule,
    OutletModule,
    CategoriesModule,
    ProductsModule,
    MerchantInventoryModule,
    TransactionsModule,
    MediaModule,
    CustomerModule,
    MerchantUserModule,
    MerchantCustomerModule,
    MerchantOverviewModule,
    MerchantInventoryModule,
    MerchantSupplierModule,
    MerchantLogModule,
    AgentAssistantModule,
    MerchantSettingsModule,
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