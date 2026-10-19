import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { AdminLoginProvider } from './admin-login.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { AdminLoginDto } from '../dto/login-admin-dto';
import { UsersService } from 'src/modules/users/users.service';
import { RefreshProvider } from './refresh.provider';

import { RegisterSellerProvider } from './register-seller.provider';
import { RegisterSellerDto } from '../dto/register-seller.dto';
import type { UploadedImageFile } from '../../../common/uploads/upload-file.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminLoginProvider: AdminLoginProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,

    private readonly usersService: UsersService,

    private readonly refreshProvider: RefreshProvider,

    private readonly registerSellerProvider: RegisterSellerProvider,
  ) {}

  async loginAdmin(dto: AdminLoginDto, response: Response) {
    return this.adminLoginProvider.adminlogin(dto, response);
  }

  async registerSeller(
    dto: RegisterSellerDto,
    files: {
      shop_logo?: UploadedImageFile[];
      shop_cover_image?: UploadedImageFile[];
    } = {},
  ) {
    return this.registerSellerProvider.register(dto, files);
  }
  // Keep your existing methods here:
  // getSession()
  // refresh()
  // registerMember()
  // registerMemberGoogle()
  // registerAuthor()
  // registerAuthorGoogle()

  refresh(request: Request, response: Response) {
    return this.refreshProvider.refresh(request, response);
  }

  async getSession(userId: number) {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return {
      success: true,
      data: {
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}
