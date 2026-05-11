/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { MerchantCustomerService } from './merchant-customer.service';

@Controller('customers')
export class MerchantCustomerController {
  constructor(private readonly customerService: MerchantCustomerService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.createOrUpdate(createCustomerDto);
  }

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }
}