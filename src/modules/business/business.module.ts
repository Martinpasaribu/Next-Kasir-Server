/* eslint-disable max-len */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Import ini wajib
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business, BusinessSchema } from './schemas/business.schema'; // Sesuaikan dengan path schema kamu

@Module({
  imports: [
    // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema }
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}