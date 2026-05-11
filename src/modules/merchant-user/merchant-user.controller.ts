/* eslint-disable max-len */
// src/modules/auth/merchant-user.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { MerchantUserService } from './merchant-user.service';
import { CreateMerchantUserDto } from './dto/create-merchant-user.dto';
import { UpdateMerchantUserDto } from './dto/update-merchant-user.dto';

@Controller('merchant-users')
export class MerchantUserController {
  constructor(private readonly merchantUserService: MerchantUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMerchantUserDto: CreateMerchantUserDto) {
    return this.merchantUserService.create(createMerchantUserDto);
  }

  @Get()
  async findAll() {
    const result = await this.merchantUserService.findAll();
    return {
      message:' Data User Merchant',
      status: true,
      data: result
    }
  }

  @Get('role')
  async findAllRole(@Query('role') role: string) {
    const result = await this.merchantUserService.findAllRole(role);
    return {
      message:` Data User ${role} Merchant`,
      status: true,
      data: result
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.merchantUserService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMerchantUserDto: UpdateMerchantUserDto) {
    return this.merchantUserService.update(id, updateMerchantUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchantUserService.remove(id);
  }
}