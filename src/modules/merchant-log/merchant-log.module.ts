// src/modules/merchant-log/merchant-log.module.ts
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantLogsService } from './merchant-log.service';
import { LogInventory, MerchantLogInventorySchema } from './schemas/merchant-log-inventory.schema';

@Global() // Opsional: Jadikan global agar tidak perlu import di setiap module
@Module({
  imports: [
    MongooseModule.forFeature([{ name: LogInventory.name, schema: MerchantLogInventorySchema }]),
  ],
  providers: [MerchantLogsService],
  exports: [MerchantLogsService],
})
export class MerchantLogModule {}