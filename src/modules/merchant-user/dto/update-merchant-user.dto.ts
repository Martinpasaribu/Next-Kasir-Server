import { PartialType } from '@nestjs/swagger';
import { CreateMerchantUserDto } from './create-merchant-user.dto';

export class UpdateMerchantUserDto extends PartialType(CreateMerchantUserDto) {}
