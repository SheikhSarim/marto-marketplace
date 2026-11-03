import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { AdminLoginProvider } from './admin-login.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { AdminLoginDto } from '../dto/login-admin-dto';
import { UsersService } from 'src/modules/users/users.service';
import { RefreshProvider } from './refresh.provider';

import { RegisterSellerProvider } from './register-seller.provider';
import { RegisterSellerDto } from '../dto/register-seller.dto';
import { LoginSellerDto } from '../dto/login-seller.dto';
import { SellerLoginProvider } from './seller-login.provider';
import { EmailVerificationService } from '../../mail/email-verification.service';
import type { UploadedImageFile } from '../../../common/uploads/upload-file.type';

// Customer imports
import { RegisterCustomerProvider } from './register-customer.provider';
import { RegisterCustomerDto } from '../dto/register-customer.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly adminLoginProvider: AdminLoginProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,

    private readonly usersService: UsersService,

    private readonly refreshProvider: RefreshProvider,

    // Seller providers
    private readonly registerSellerProvider: RegisterSellerProvider,
    private readonly sellerLoginProvider: SellerLoginProvider,

    // Customer provider
    private readonly registerCustomerProvider: RegisterCustomerProvider,

    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  // =========================
  // ADMIN AUTH
  // =========================

  async loginAdmin(dto: AdminLoginDto, response: Response) {
    return this.adminLoginProvider.adminlogin(dto, response);
  }

  // =========================
  // SELLER AUTH
  // =========================

  async loginSeller(dto: LoginSellerDto, response: Response) {
    return this.sellerLoginProvider.login(dto, response);
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

  // =========================
  // CUSTOMER AUTH
  // =========================

  async registerCustomer(dto: RegisterCustomerDto) {
    return this.registerCustomerProvider.register(dto);
  }



  // =========================
  // EMAIL VERIFICATION
  // =========================

  async verifyEmail(token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  // =========================
  // SESSION & TOKEN MANAGEMENT
  // =========================

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