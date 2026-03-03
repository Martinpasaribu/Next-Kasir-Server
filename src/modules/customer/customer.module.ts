import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from '../transactions/schemas/transaction.schema';
import { InventoryModule } from '../inventory/inventory.module';
import { Customer, CustomerSchema } from './schemas/customer.schema';

@Module({

  imports: [
    // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Customer.name, schema: CustomerSchema }
    ]),
    InventoryModule,
  ],

  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService, MongooseModule],
})

export class CustomerModule {}
