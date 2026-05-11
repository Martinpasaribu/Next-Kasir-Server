import { Module } from '@nestjs/common';
import { MerchantOverviewService } from './merchant-overview.service';
import { MerchantOverviewController } from './merchant-overview.controller';
import { TenantModule } from '@/core/tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [MerchantOverviewController],
  providers: [MerchantOverviewService],
})
export class MerchantOverviewModule {}
