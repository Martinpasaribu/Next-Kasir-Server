// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({

    imports: [
      // Tambahkan ini agar BusinessModel bisa di-inject ke BusinessService
      MongooseModule.forFeature([
        { name: Product.name, schema: ProductSchema },
        { name: Category.name, schema: CategorySchema }
      ]),
    ],


  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}