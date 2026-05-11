/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/agent-assistant/agent-assistant.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentAssistantController } from './agent-assistant.controller';
import { AgentAssistantService } from './agent-assistant.service';
import { GeminiStrategy } from './strategies/gemini.strategy';
import { ClaudeStrategy } from './strategies/claude.strategy';
import { GrokStrategy } from './strategies/grok.strategy';
// Import Schema Anda di sini
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Recipe, RecipeSchema } from '../merchant-inventory/schemas/recipe.schema';
import { Inventory, InventorySchema } from '../merchant-inventory/schemas/inventory.schema';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProductsModule } from '../products/products.module';
import { SourceLibrary } from './library/source.library';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: Inventory.name, schema: InventorySchema }
      
    ]),
    forwardRef(() => ProductsModule),      // Gunakan forwardRef
    forwardRef(() => TransactionsModule),  // Gunakan forwardRef
  ],
  controllers: [AgentAssistantController],
  providers: [
    AgentAssistantService,
    GeminiStrategy,
    ClaudeStrategy,
    GrokStrategy,
    SourceLibrary
  ],
})
export class AgentAssistantModule {}