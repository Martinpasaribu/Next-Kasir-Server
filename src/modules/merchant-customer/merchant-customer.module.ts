import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { Customer, MerchantCustomerSchema } from './schemas/merchant-customer.schema';
import { MerchantCustomerService } from './merchant-customer.service';
import { MerchantCustomerController } from './merchant-customer.controller';
import { MerchantInventoryModule } from '../merchant-inventory/merchant-inventory.module';

@Module({

  imports: [
    // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Customer.name, schema: MerchantCustomerSchema }
    ]),
    MerchantInventoryModule,
  ],

  controllers: [MerchantCustomerController],
  providers: [MerchantCustomerService],
  exports: [MerchantCustomerService, MongooseModule],
})

export class MerchantCustomerModule {}
