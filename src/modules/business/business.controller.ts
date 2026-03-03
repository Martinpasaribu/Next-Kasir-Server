/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/business/business.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  UseGuards, 
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
  @ApiOperation({ summary: 'Mendaftarkan bisnis baru (Tenant Registration)' })
  async register(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.registerNewBusiness(createBusinessDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Mengambil profil bisnis berdasarkan header tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async getProfile(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.businessService.getBusinessProfile(tenantId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Mengupdate informasi bisnis/perusahaan' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  async update(
    @Headers('x-tenant-id') tenantId: string, 
    @Body() updateBusinessDto: UpdateBusinessDto
  ) {
    // Logic untuk update profil bisnis di Master DB
    return this.businessService.updateBusiness(tenantId, updateBusinessDto);
  }
}