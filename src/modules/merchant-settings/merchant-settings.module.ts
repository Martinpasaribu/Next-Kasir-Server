import { Module } from '@nestjs/common';
import { MerchantSettingsService } from './merchant-settings.service';
import { MerchantSettingsController } from './merchant-settings.controller';

@Module({
  controllers: [MerchantSettingsController],
  providers: [MerchantSettingsService],
})
export class MerchantSettingsModule {}
