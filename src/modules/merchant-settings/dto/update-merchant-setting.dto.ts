import { PartialType } from '@nestjs/swagger';
import { CreateMerchantSettingDto } from './create-merchant-setting.dto';

export class UpdateMerchantSettingDto extends PartialType(CreateMerchantSettingDto) {}
