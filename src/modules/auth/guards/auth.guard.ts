/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/common/guards/roles.guard.ts
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Tips: Tambahkan check user.role untuk jaga-jaga jika objek user kosong
    if (!user || !user.role) {
      throw new ForbiddenException('User tidak memiliki akses (Role Missing)');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`Akses ditolak: Membutuhkan salah satu dari [${requiredRoles}]`);
    }

    return true;
  }
}


// HOW TO USE IN CONTROLLER

// @Post('create-product')
// @SetMetadata('roles', ['OWNER', 'MANAGER']) // Hanya Owner & Manager toko yang bisa
// @UseGuards(JwtAuthGuard, RolesGuard)
// async create(...) { ... }