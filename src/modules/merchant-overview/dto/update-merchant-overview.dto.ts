import { PartialType } from '@nestjs/swagger';
import { CreateMerchantOverviewDto } from './create-merchant-overview.dto';

export class UpdateMerchantOverviewDto extends PartialType(CreateMerchantOverviewDto) {}
