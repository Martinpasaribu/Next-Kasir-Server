// src/modules/business/business.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Headers,
  BadRequestException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@ApiTags('Business (Master)')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('register')
  @ApiOperation({ summary: 'Mendaftarkan bisnis baru' })
  async register(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.registerNewBusiness(createBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'List semua bisnis (Admin Only)' })
  async findAll() {
    const res = await this.businessService.findAll();
    return {
        status: true,
        message: "data business",
        data: res
    }
  }

  @Get('profile')
  @ApiOperation({ summary: 'Ambil profil via header tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async getProfile(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.businessService.getBusinessProfile(tenantId);
  }

  // Update via ID (Untuk Halaman List Bisnis)
  @Patch(':id')
  @ApiOperation({ summary: 'Update bisnis berdasarkan MongoDB ID' })
  async updateById(
    @Param('id') id: string, 
    @Body() updateBusinessDto: UpdateBusinessDto
  ) {
    return this.businessService.updateById(id, updateBusinessDto);
  }

  // Delete via ID (Untuk Halaman List Bisnis)
  @Delete(':id')
  @ApiOperation({ summary: 'Hapus bisnis / Terminate instance' })
  async remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }

  @Patch('update-profile')
  @ApiOperation({ summary: 'Update profil via header' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async updateProfile(
    @Headers('x-tenant-id') tenantId: string, 
    @Body() updateDto: UpdateBusinessDto
  ) {
    return this.businessService.updateBusiness(tenantId, updateDto);
  }
}