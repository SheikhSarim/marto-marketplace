import {
  Controller,
  Get,
  Req,
  UseGuards,
  Logger,
  Body,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { ShopsService } from './shops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { UpdateShopDto } from './dto/update-shop.dto';
import type { UploadedImageFile } from '../../common/uploads/upload-file.type';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';

@ApiTags('Shops')
@ApiBearerAuth()
@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class ShopsController {
  private readonly logger = new Logger(ShopsController.name);

  constructor(private readonly shopsService: ShopsService) {}

  // GET MY SHOP
  @Get('me')
  @ApiOperation({
    summary: 'Get my shop details',
    description: 'Retrieves the authenticated seller’s shop details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop details retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  async getMyShop(@Req() req: any) {
    const userId = req.user.id;

    this.logger.log(`Seller requested shop details. User ID: ${userId}`);

    return this.shopsService.getMyShop(userId);
  }

  // UPDATE MY SHOP
  @Patch('me')
  @ApiOperation({
    summary: 'Update my shop details',
    description:
      'Updates the authenticated seller’s shop information. Only provided fields are updated. Images and status cannot be changed through this endpoint.',
  })
  @ApiBody({
    type: UpdateShopDto,
    description: 'Provide the shop fields you want to update.',
  })
  @ApiResponse({ status: 200, description: 'Shop updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  async updateMyShop(@Req() req: any, @Body() dto: UpdateShopDto) {
    const userId = req.user.id;

    this.logger.log(`Seller updating shop details. User ID: ${userId}`);

    return this.shopsService.updateMyShop(userId, dto);
  }

  // UPDATE SHOP IMAGES
  @Patch('me/images')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'cover_image', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (_req, file, callback) => {
          const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

          if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
              new BadRequestException(
                'Only JPG, JPEG, PNG, and WebP images are allowed.',
              ),
              false,
            );
          }

          callback(null, true);
        },
      },
    ),
  )
  @ApiOperation({
    summary: 'Update shop logo and/or cover image',
    description:
      'Allows the authenticated seller to update the shop logo, cover image, or both. Maximum file size is 5 MB per image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
        },
        cover_image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Shop images updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'No image provided or invalid image format/size.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  async updateMyShopImages(
    @Req() req: any,
    @UploadedFiles()
    files: {
      logo?: UploadedImageFile[];
      cover_image?: UploadedImageFile[];
    },
  ) {
    const userId = req.user.id;

    this.logger.log(`Seller updating shop images. User ID: ${userId}`);

    if (!files?.logo?.length && !files?.cover_image?.length) {
      throw new BadRequestException(
        'Please provide at least one image: logo or cover_image.',
      );
    }

    return this.shopsService.updateMyShopImages(userId, files);
  }

  @Patch('me/status')
  @ApiOperation({
    summary: 'Update my shop status',
    description:
      'Allows the authenticated seller to activate or deactivate their own shop, subject to shop status permissions.',
  })
  @ApiBody({ type: UpdateShopStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Shop status updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  @ApiResponse({
    status: 403,
    description: 'Seller cannot change this shop status.',
  })
  @ApiResponse({ status: 404, description: 'Shop not found.' })
  async updateMyShopStatus(@Req() req: any, @Body() dto: UpdateShopStatusDto) {
    const userId = req.user.id;

    this.logger.log(`Seller updating shop status. User ID: ${userId}`);

    return this.shopsService.updateMyShopStatus(userId, dto);
  }
}
