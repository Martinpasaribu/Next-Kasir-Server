/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
// import { TenantService } from '../../core/tenant/tenant.service';

// @Injectable()
// export class TenantGuard implements CanActivate {
//   constructor(private readonly tenantService: TenantService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const tenantId = request.headers['x-tenant-id'];

//     if (!tenantId) {
//       throw new BadRequestException('Header x-tenant-id wajib disertakan');
//     }

//     // Validasi apakah tenant ini benar-benar ada di Master DB
//     await this.tenantService.getTenant(tenantId);

//     return true;
//   }
// }