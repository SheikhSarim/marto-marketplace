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
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthService } from './providers/auth.service';
import { AdminLoginDto } from './dto/login-admin-dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { UploadedImageFile } from '../../common/uploads/upload-file.type';

import { RegisterSellerDto } from './dto/register-seller.dto';
import { LoginSellerDto } from './dto/login-seller.dto';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_SIZE,
} from '../../common/uploads/upload.constants';

@Controller('auth')
// @Auth(AuthType.None)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Silent Session Check
  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Silent session check on app start' })
  async session(@Req() req: any) {
    // console.log('[Session] Cookies:', req.cookies);
    // console.log('[Session] All cookies:', req.cookies);
    // console.log('[Session] access_token:', req.cookies?.access_token);

    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return this.authService.getSession(req.user.id);
  }

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

  @Auth(AuthType.None)
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a seller email address using the emailed one-time link',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

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

  @Auth(AuthType.None)
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.loginAdmin(dto, response);
  }

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
}
