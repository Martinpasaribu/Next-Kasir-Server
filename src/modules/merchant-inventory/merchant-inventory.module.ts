/* eslint-disable max-len */
import { Module, forwardRef } from '@nestjs/common'; // Tambahkan forwardRef
import { MerchantInventoryService } from './merchant-inventory.service';
import { MerchantInventoryController } from './merchant-inventory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { TransactionsModule } from '../transactions/transactions.module';
import { RecipeService } from './recipe.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recipe.name, schema: RecipeSchema },
      { name: Inventory.name, schema: InventorySchema }
    ]),
    forwardRef(() => ProductsModule),      // Gunakan forwardRef
    forwardRef(() => TransactionsModule),  // Gunakan forwardRef
  ],
  controllers: [MerchantInventoryController],
  providers: [MerchantInventoryService, RecipeService],
  exports: [MerchantInventoryService, RecipeService],     // Jangan lupa di-export agar bisa dipakai di module lain
})

export class MerchantInventoryModule {}