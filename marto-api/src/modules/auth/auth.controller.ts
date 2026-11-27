import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import { AuthService } from './providers/auth.service';
import { AdminLoginDto } from './dto/login-admin-dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { UploadedImageFile } from '../../common/uploads/upload-file.type';

import { RegisterSellerDto } from './dto/register-seller.dto';
import { LoginSellerDto } from './dto/login-seller.dto';

import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_SIZE,
} from '../../common/uploads/upload.constants';

import { RegisterCustomerDto } from './dto/register-customer.dto';
import { EmailDto } from './dto/email.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { VerifyEmailChangeDto } from './dto/verify-email-change.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ==========================================
  // SESSION
  // ==========================================

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Silent session check on app start',
    description:
      'Checks whether the current user has a valid authenticated session using the access token cookie.',
  })
  @ApiOkResponse({
    description: 'Session is valid and user is authenticated.',
    schema: {
      example: {
        success: true,
        data: {
          isAuthenticated: true,
          user: {
            id: '20c27893-8438-4d26-937c-12345667785ew',
            email: 'example@demo.com',
            role: 'ROLE',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Access token is missing, invalid, or expired.',
    schema: {
      example: {
        message: 'Token not found.',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  async session(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.getSession(req.user.id);
  }

  // ==========================================
  // REFRESH TOKEN
  // ==========================================

  @Auth(AuthType.None)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token using refresh_token cookie',
    description:
      'refresh_token cookie ya x-refresh-token header se new access token issue hoga.',
  })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // ==========================================
  // SELLER EMAIL VERIFICATION
  // ==========================================

  @Auth(AuthType.None)
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a seller email address using the emailed one-time link',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ==========================================
  // SELLER LOGIN
  // ==========================================

  @Auth(AuthType.None)
  @Post('seller/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in a seller only after email verification and admin approval',
  })
  async loginSeller(
    @Body() dto: LoginSellerDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginSeller(dto, response);
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  @Auth(AuthType.None)
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginAdmin(dto, response);
  }

  // ==========================================
  // SELLER REGISTRATION
  // ==========================================

  @Auth(AuthType.None)
  @Post('register/seller')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a seller and submit their shop for approval',
    description:
      'Send all text fields and optional shop_logo/shop_cover_image files as multipart/form-data. Images are uploaded to Cloudinary by the API; do not send image URLs.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'name',
        'email',
        'password',
        'business_name',
        'business_email',
        'business_phone',
        'cnic',
        'business_address',
        'city',
        'shop_name',
        'shop_description',
        'shop_category',
        'delivery_information',
      ],
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: {
          type: 'string',
          format: 'email',
          example: 'seller@example.com',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'SecurePass123!',
        },
        business_name: { type: 'string', example: 'ABC Traders' },
        business_email: {
          type: 'string',
          format: 'email',
          example: 'contact@abctraders.com',
        },
        business_phone: { type: 'string', example: '+923001234567' },
        cnic: { type: 'string', example: '3520212345671' },
        business_address: {
          type: 'string',
          example: 'Shop 12, Main Boulevard, Gulberg',
        },
        city: { type: 'string', example: 'Lahore' },
        shop_name: { type: 'string', example: 'ABC Traders Official Store' },
        shop_description: {
          type: 'string',
          example: 'Everyday essentials and quality products from ABC Traders.',
        },
        shop_category_id: {
          type: 'string',
          format: 'uuid',
          description:
            'Select an active category using GET /shop-categories/active and provide its UUID.',
          example: 'cb58c632-eb3f-4c74-a561-47791f1a62eb',
        },
        custom_category_name: {
          type: 'string',
          description:
            'Required only when the selected shop category is Other.',
          example: 'Musical Instruments',
        },
        shop_category: { type: 'string', example: 'General Store' },
        delivery_information: {
          type: 'string',
          example: 'Delivery available in Lahore within 2-4 business days.',
        },
        shop_logo: {
          type: 'string',
          format: 'binary',
          description:
            'Optional shop logo image (JPEG, PNG or WebP; max 5 MB).',
        },
        shop_cover_image: {
          type: 'string',
          format: 'binary',
          description:
            'Optional shop cover image (JPEG, PNG or WebP; max 5 MB).',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'shop_logo', maxCount: 1 },
        { name: 'shop_cover_image', maxCount: 1 },
      ],
      {
        limits: { fileSize: IMAGE_UPLOAD_MAX_SIZE, files: 2 },
        fileFilter: (_request, file, callback) => {
          if (
            !(ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(
              file.mimetype,
            )
          ) {
            callback(
              new BadRequestException(
                'Unsupported image type. Please upload a JPEG, PNG or WebP image.',
              ),
              false,
            );
            return;
          }

          callback(null, true);
        },
      },
    ),
  )
  async registerSeller(
    @Body() dto: RegisterSellerDto,
    @UploadedFiles()
    files: {
      shop_logo?: UploadedImageFile[];
      shop_cover_image?: UploadedImageFile[];
    },
  ) {
    return this.authService.registerSeller(dto, files);
  }

  // ==========================================
  // CUSTOMER REGISTRATION
  // ==========================================

  @Auth(AuthType.None)
  @Post('register/customer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  async registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================

  @Auth(AuthType.None)
  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  async loginCustomer(
    @Body() dto: LoginCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginCustomer(dto, response);
  }

  // ==========================================
  // CUSTOMER EMAIL VERIFICATION
  // ==========================================

  @Auth(AuthType.None)
  @Post('customer/resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend customer email verification link',
  })
  async resendCustomerVerification(@Body() dto: EmailDto) {
    return this.authService.resendCustomerVerification(dto.email);
  }

  // ==========================================
  // CUSTOMER PASSWORD MANAGEMENT
  // ==========================================

  @Auth(AuthType.None)
  @Post('customer/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a customer password reset link',
  })
  async forgotCustomerPassword(@Body() dto: EmailDto) {
    return this.authService.forgotCustomerPassword(dto.email);
  }

  @Auth(AuthType.None)
  @Post('customer/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset customer password using reset token',
  })
  async resetCustomerPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetCustomerPassword(dto);
  }

  // ==========================================
  // EMAIL CHANGE
  // ==========================================

  @Post('email/change-request')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request email address change',
    description:
      'Customer or Seller can request an email change after verifying their current password. A verification link will be sent to the new email address.',
  })
  @ApiBody({
    type: RequestEmailChangeDto,
    schema: {
      example: {
        current_password: 'CurrentPassword123!',
        new_email: 'newemail@example.com',
      },
    },
  })
  @ApiOkResponse({
    description: 'Verification email sent successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Verification email sent successfully.',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid current password or unauthorized.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid current password',
        error: 'Unauthorized',
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email address is already registered.',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email address is already registered.',
        error: 'Conflict',
      },
    },
  })
  async requestEmailChange(
    @Req() request: any,
    @Body() dto: RequestEmailChangeDto,
  ) {
    if (!request.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.requestEmailChange(
      request.user.id,
      request.user.role,
      dto.current_password,
      dto.new_email,
    );
  }

  @Auth(AuthType.None)
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify new email address',
    description:
      'Verifies the email change token and updates the account email address.',
  })
  @ApiOkResponse({
    description: 'Email address updated successfully.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification token.',
  })
  @ApiConflictResponse({
    description: 'Email address is already registered.',
  })
  async verifyEmailChange(@Body() dto: VerifyEmailChangeDto) {
    return this.authService.verifyEmailChange(dto.token);
  }
  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change current password',
    description:
      'Allows authenticated customers and sellers to change their password after verifying their current password.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    description: 'Password changed successfully.',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully.',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is incorrect or user is unauthenticated.',
  })
  @ApiForbiddenResponse({
    description: 'Super Admin is not allowed to use this endpoint.',
  })
  @ApiBadRequestResponse({
    description: 'New password is invalid or same as current password.',
  })
  async changePassword(@Req() request: any, @Body() dto: ChangePasswordDto) {
    if (!request.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.changePassword(
      request.user.id,
      request.user.role,
      dto.current_password,
      dto.new_password,
    );
  }
}
