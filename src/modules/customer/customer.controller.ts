/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.createOrUpdate(createCustomerDto);
  }

  @Get()
  async findAll() {
    return this.customerService.findAll();
  }
}