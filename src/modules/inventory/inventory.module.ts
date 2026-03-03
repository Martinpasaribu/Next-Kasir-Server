// src/modules/inventory/inventory.module.ts

import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { StockLog, StockLogSchema } from './schemas/stock-log.schema';
import { ProductsModule } from '../products/products.module';

@Module({

  imports: [
    // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
    MongooseModule.forFeature([
      { name: StockLog.name, schema: StockLogSchema }
    ]),
    ProductsModule, // Pastikan module produk di-import agar bisa akses model produk
  ],

  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}