import { Module } from '@nestjs/common';
import { MerchantSupplierService } from './merchant-supplier.service';
import { MerchantSupplierController } from './merchant-supplier.controller';

@Module({
  controllers: [MerchantSupplierController],
  providers: [MerchantSupplierService],
  exports: [MerchantSupplierService]
})
export class MerchantSupplierModule {}
