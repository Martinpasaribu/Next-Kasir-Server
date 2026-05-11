import { PartialType } from '@nestjs/swagger';
import { CreateMerchantSupplierDto } from './create-merchant-supplier.dto';

export class UpdateMerchantSupplierDto extends PartialType(CreateMerchantSupplierDto) {}
