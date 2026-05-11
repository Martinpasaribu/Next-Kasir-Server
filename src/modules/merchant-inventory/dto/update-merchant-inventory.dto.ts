import { PartialType } from '@nestjs/swagger';
import { CreateMerchantInventoryDto } from './create-merchant-inventory.dto';

export class UpdateMerchantInventoryDto extends PartialType(CreateMerchantInventoryDto) {}
