// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { MerchantLogService } from './merchant-log.service';
// import { CreateMerchantLogDto } from './dto/create-merchant-log.dto';
// import { UpdateMerchantLogDto } from './dto/update-merchant-log.dto';

// @Controller('merchant-log')
// export class MerchantLogController {
//   constructor(private readonly merchantLogService: MerchantLogService) {}

//   @Post()
//   create(@Body() createMerchantLogDto: CreateMerchantLogDto) {
//     return this.merchantLogService.create(createMerchantLogDto);
//   }

//   @Get()
//   findAll() {
//     return this.merchantLogService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.merchantLogService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateMerchantLogDto: UpdateMerchantLogDto) {
//     return this.merchantLogService.update(+id, updateMerchantLogDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.merchantLogService.remove(+id);
//   }
// }
