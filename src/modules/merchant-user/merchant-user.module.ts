import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; 
import { MerchantUserService } from './merchant-user.service';
import { MerchantUserController } from './merchant-user.controller';
import { MerchantUser, MerchantUserSchema } from './schemas/merchant-user.schema';
import { OutletModule } from '../outlet/outlet.module';

@Module({
  imports: [
    // Daftarkan schema di sini
    MongooseModule.forFeature([
      { name: MerchantUser.name, schema: MerchantUserSchema }
    ]),
    OutletModule,
  ],
  controllers: [MerchantUserController],
  providers: [MerchantUserService],
})
export class MerchantUserModule {}
