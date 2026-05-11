/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
// src/modules/business/business.service.ts
import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Business } from './schemas/business.schema';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { MerchantUserSchema } from '../merchant-user/schemas/merchant-user.schema';
import * as bcrypt from 'bcrypt';
import { generateSafeTenantId } from '../../common/utils/generator/TENANT_ID';
import { OutletSchema } from '../outlet/schemas/outlet.schema';
import { generateOutletCode } from '../../common/utils/generator/CODE_OUT';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<Business>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async registerNewBusiness(dto: CreateBusinessDto): Promise<Business> {
      const { outlet_name, ...businessData } = dto;
      const { tenant_id, email, password, owner_name } = businessData;

      const { id: finalTenantId, suffix } = generateSafeTenantId(tenant_id);

      const existing = await this.businessModel.findOne({
        $or: [{ tenant_id: finalTenantId }, { email }],
      });
      
      if (existing) {
        const field = existing.email === email ? 'Email' : 'Nama Bisnis';
        throw new ConflictException(`${field} sudah terdaftar, silakan gunakan yang lain`);
      }
      
      const newBusiness = new this.businessModel({
          ...businessData,
          tenant_id: finalTenantId,
          tenant_suffix: suffix,
          tenant_domain: `${finalTenantId}.nextkasir.com`, // Gunakan finalTenantId agar sinkron
      });
      const savedBusiness = await newBusiness.save();

      try {
        // 3. SWITCH DATABASE
        // Tambahkan nullish check pada connection
        const tenantDb = this.connection.useDb(finalTenantId, { useCache: true });
        
        // 4. GET MODELS (Gunakan Singleton Pattern untuk Tenant Models)
        const MerchantModel = tenantDb.model('MerchantUser', MerchantUserSchema);
        const OutletModel = tenantDb.model('Outlet', OutletSchema);
        
        // 5. CREATE OUTLET
        const generatedCode = await generateOutletCode(OutletModel, outlet_name);
        
        // Gunakan .insertMany atau .create tapi pastikan model terikat ke tenantDb
        const [newOutlet] = await OutletModel.insertMany([{
          name: outlet_name,
          code: generatedCode,
          is_active: true,
        }]);

        // 6. HASHING PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // 7. CREATE OWNER
        await MerchantModel.create([{
          email: email,
          username: owner_name,
          full_name: owner_name,
          password: hashedPassword,
          role: 'OWNER',
          isActive: true,
          accessible_outlets: [newOutlet._id] 
        }]);

        return savedBusiness;

      } catch (error: any) {
        console.error('ERROR_PROVISIONING:', error);
        await this.businessModel.findByIdAndDelete(savedBusiness._id);
        throw new InternalServerErrorException({
          message: 'Gagal inisialisasi database tenant',
          detail: error.message
        });
      }
  }

  /** Ambil semua bisnis untuk admin dashboard */
  async findAll(): Promise<Business[]> {
    return this.businessModel.find().sort({ createdAt: -1 }).exec();
  }

  async getBusinessProfile(tenantId: string): Promise<Business> {
    const business = await this.businessModel.findOne({ tenant_id: tenantId });
    if (!business) throw new NotFoundException(`Tenant ${tenantId} tidak ditemukan`);
    return business;
  }

  /** Update menggunakan MongoDB _id (Halaman List) */
  async updateById(id: string, updateDto: UpdateBusinessDto): Promise<Business> {
    const updated = await this.businessModel.findByIdAndUpdate(
      id,
      { $set: updateDto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Bisnis tidak ditemukan');
    return updated;
  }

  /** Update menggunakan tenant_id (Header x-tenant-id) */
  async updateBusiness(tenantId: string, updateDto: UpdateBusinessDto): Promise<Business> {
    const updated = await this.businessModel.findOneAndUpdate(
      { tenant_id: tenantId },
      { $set: updateDto },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Bisnis tidak ditemukan');
    return updated;
  }

  /** Hard Delete Instance Bisnis */
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.businessModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Gagal menghapus, ID tidak ditemukan');
    return { message: `Instance ${result.name} berhasil dihapus dari cluster` };
  }

  /** Helper Middleware */
  // async validateTenantStatus(tenantId: string): Promise<boolean> {
  //   const business = await this.businessModel.findOne({ tenant_id: tenantId.replace("tenant_", "")}); // Pastikan tenantId yang dicek sesuai dengan format di Master DB (tanpa prefix 'tenant_')
    
  //   if (!business || !business.isActive) return false;
    
  //   // Logic Expired_at Tipe Date
  //   if (business.expired_at && new Date() > new Date(business.expired_at)) {
  //     return false;
  //   }

  //   return true;
  // }
}