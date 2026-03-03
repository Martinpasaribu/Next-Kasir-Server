/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { InventoryModule } from '../inventory/inventory.module';
import { CustomerModule } from '../customer/customer.module';

@Module({

  imports: [
    // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema }
    ]),
    InventoryModule,
    CustomerModule,
  ],

  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],

})
export class TransactionsModule {}
