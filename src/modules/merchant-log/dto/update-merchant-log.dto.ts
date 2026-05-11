import { PartialType } from '@nestjs/swagger';
import { CreateMerchantLogDto } from './create-merchant-log.dto';

export class UpdateMerchantLogDto extends PartialType(CreateMerchantLogDto) {}
