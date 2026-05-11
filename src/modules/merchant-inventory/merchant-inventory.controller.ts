/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query, 
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { MerchantInventoryService } from './merchant-inventory.service';
import { RecipeService } from './recipe.service'; // Inject Service Recipe yang dipisah
import { Types } from 'mongoose';
import { MediaObject } from '../media/schema/media.schema';

@ApiTags('Merchant Inventory & Recipe')
@ApiHeader({ 
  name: 'x-tenant-id', 
  description: 'ID Bisnis / Tenant', 
  required: true 
})
@ApiHeader({ 
  name: 'x-outlet-id', 
  description: 'ID Outlet Spesifik', 
  required: true 
})
@Controller('inventory')
export class MerchantInventoryController {
  constructor(
    private readonly inventoryService: MerchantInventoryService,
    private readonly recipeService: RecipeService, // Tambahkan di sini
  ) {}

  // ==========================================================
  // SECTION: INVENTORY
  // ==========================================================

  @Get('admin')
  @ApiOperation({ summary: 'Mengambil semua bahan baku Admin' })
  findDataToAdmin() {
    return this.inventoryService.findAllToAdmin();
  }

  @Post('register/admin')
  @ApiOperation({ summary: 'Mendaftarkan produk ke tabel inventory outlet' })
  async registerInventory(@Body() data: { name: string, sku: string; stock: number; supplier_id?: string, unit: string, image: MediaObject }) {
    return {
      status: true,
      message: 'Produk berhasil didaftarkan ke inventory outlet',
      data: await this.inventoryService.registerNewInventory(data)
    };
  }

  @Put('restock-manual/:id/admin')
  async handleManual(@Param('id') id: string, @Body() dto: any) {
    return {
      status: true,
      message: 'Produk berhasil didaftarkan ke inventory outlet',
      data: await this.inventoryService.manualAddStock(id, dto)
    };
  }

  @Put('restock-supplier/:id/admin')
  async handleSupplier(@Param('id') id: string, @Body() dto: any) {
    return await this.inventoryService.restockFromSupplier(id, dto);
  }

  @Get('logs/admin')
  @ApiOperation({ summary: 'Melihat riwayat log inventory (Audit Trail)' })
  async getInventoryLogs(
    @Query('product_id') productId?: string,
    @Query('type') type?: string,
  ) {
    const filter: any = {};
    if (productId) filter.product_id = new Types.ObjectId(productId);
    if (type) filter.type = type;

    const logs = await this.inventoryService.getStockLogs(filter);
    
    return {
      status: true,
      message: "Data riwayat stok berhasil diambil",
      data: logs
    };
  }

  @Delete(':id/admin')
  @ApiOperation({ summary: 'Menghapus Material (Soft Delete)' })
  remove(@Param('id') id: string) {
    // Hapus tanda '+'
    return this.inventoryService.remove(id);
  }

  // ==========================================================
  // SECTION: RECIPE (Resep)
  // ==========================================================

  @Get('recipes/admin')
  @ApiOperation({ summary: 'Mengambil semua Recipe Admin' })
  async findAllRecipeToAdmin() {
    return {
      status: true,
      data: await this.recipeService.findAll()
    };
  }

  @Post('recipes/admin')
  @ApiOperation({ summary: 'Mendaftarkan resep baru untuk produk jual' })
  async createRecipe(@Body() data: { product_id: string; ingredients: { material_id: string; quantity: number }[] }) {
    return {
      status: true,
      message: 'Resep berhasil dibuat',
      data: await this.recipeService.create(data)
    };
  }

  @Get('recipes/:productId')
  @ApiOperation({ summary: 'Melihat detail resep berdasarkan ID Produk' })
  async getRecipeDetail(@Param('productId') productId: string) {
    return {
      status: true,
      data: await this.recipeService.findByProduct(productId)
    };
  }

  @Put('recipes/:productId')
  @ApiOperation({ summary: 'Update komposisi resep' })
  async updateRecipe(
    @Param('productId') productId: string,
    @Body('ingredients') ingredients: { material_id: string; quantity: number }[]
  ) {
    return {
      status: true,
      message: 'Resep berhasil diperbarui',
      data: await this.recipeService.update(productId, ingredients)
    };
  }

  @Delete('recipes/:id/admin')
  @ApiOperation({ summary: 'Menghapus recipe (Soft Delete)' })
  async removeRecipes(@Param('id') id: string) {
    await this.recipeService.remove(id);
    return {
      status: true,
      message: 'Resep berhasil dihapus'
    };
  }


  // ==========================================================
  // SECTION: REPORTS & ANALYTICS
  // ==========================================================

  @Get('report/cogs')
  @ApiOperation({ summary: 'Laporan pengeluaran modal (HPP) berdasarkan periode' })
  async getCogsReport(
    @Query('startDate') start: string,
    @Query('endDate') end: string,
  ) {
    // Implementasikan agregasi di service jika dibutuhkan
    return {
        status: true,
        message: "Fitur laporan dalam pengembangan"
    };
  }
}