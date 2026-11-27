import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { AdminLoginProvider } from './admin-login.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { UsersService } from 'src/modules/users/users.service';
import { RefreshProvider } from './refresh.provider';

import { RegisterSellerProvider } from './register-seller.provider';
import { RegisterSellerDto } from '../dto/register-seller.dto';
import { LoginSellerDto } from '../dto/login-seller.dto';
import { SellerLoginProvider } from './seller-login.provider';

import { EmailChangeProvider } from './email-change.provider';
import { EmailVerificationService } from '../../mail/email-verification.service';
import type { UploadedImageFile } from '../../../common/uploads/upload-file.type';

// Admin DTO
import { AdminLoginDto } from '../dto/login-admin-dto';

// Customer DTOs
import { RegisterCustomerDto } from '../dto/register-customer.dto';
import { LoginCustomerDto } from '../dto/login-customer.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

// Customer Providers
import { RegisterCustomerProvider } from './register-customer.provider';
import { LoginCustomerProvider } from './customer-login.provider';
import { CustomerPasswordProvider } from './customer-password.provider';
import { CustomerEmailVerificationProvider } from './customer-email-verification.provider';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminLoginProvider: AdminLoginProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,

    private readonly usersService: UsersService,
    private readonly refreshProvider: RefreshProvider,
    private readonly emailChangeProvider: EmailChangeProvider,
    // Seller providers
    private readonly registerSellerProvider: RegisterSellerProvider,
    private readonly sellerLoginProvider: SellerLoginProvider,

    // Customer providers
    private readonly registerCustomerProvider: RegisterCustomerProvider,
    private readonly loginCustomerProvider: LoginCustomerProvider,
    private readonly customerPasswordProvider: CustomerPasswordProvider,
    private readonly customerEmailVerificationProvider: CustomerEmailVerificationProvider,

    // Email verification
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

  async loginCustomer(dto: LoginCustomerDto, response: Response) {
    return this.loginCustomerProvider.login(dto, response);
  }

  // =========================
  // CUSTOMER EMAIL VERIFICATION
  // =========================

  async resendCustomerVerification(email: string) {
    return this.customerEmailVerificationProvider.resendVerification(email);
  }

  async verifyEmail(token: string) {
    return this.emailVerificationService.verifyEmail(token);
  }

  // =========================
  // CUSTOMER PASSWORD
  // =========================

  async forgotCustomerPassword(email: string) {
    return this.customerPasswordProvider.forgotPassword(email);
  }

  async resetCustomerPassword(dto: ResetPasswordDto) {
    return this.customerPasswordProvider.resetPassword(dto.token, dto.password);
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

  async requestEmailChange(
    userId: string,
    role: UserRole,
    currentPassword: string,
    newEmail: string,
  ) {
    return this.emailChangeProvider.requestEmailChange(
      userId,
      role,
      currentPassword,
      newEmail,
    );
  }

  async verifyEmailChange(token: string) {
    return this.emailChangeProvider.verifyEmailChange(token);
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  
  async changePassword(
    userId: string,
    role: UserRole,
    currentPassword: string,
    newPassword: string,
  ) {
    return this.customerPasswordProvider.changePassword(
      userId,
      role,
      currentPassword,
      newPassword,
    );
  }
}
