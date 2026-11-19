import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-roles.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import type { UploadedImageFile } from '../../common/uploads/upload-file.type';

@ApiTags('Seller Products')
@ApiBearerAuth()
@Controller('seller/shops/:shopId/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SELLER)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product for an owned shop' })
  @ApiParam({ name: 'shopId', format: 'uuid' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  create(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createSellerProduct(req.user.id, shopId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated products belonging to an owned shop',
  })
  findAll(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findSellerProducts(req.user.id, shopId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product belonging to an owned shop' })
  findOne(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.findSellerProduct(req.user.id, shopId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product belonging to an owned shop' })
  @ApiBody({ type: UpdateProductDto })
  update(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateSellerProduct(
      req.user.id,
      shopId,
      id,
      dto,
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Enable or disable a seller-owned product' })
  @ApiBody({ type: UpdateProductStatusDto })
  updateStatus(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productsService.updateSellerProductStatus(
      req.user.id,
      shopId,
      id,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-remove a product belonging to an owned shop' })
  remove(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.removeSellerProduct(req.user.id, shopId, id);
  }

  // UPLOAD PRODUCT IMAGES
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('images', 8, {
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
    }),
  )
  @ApiOperation({
    summary: 'Upload product images',
    description:
      'Allows the authenticated seller to upload multiple images for a product. Maximum 8 images per product and 5 MB per image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['images'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product images uploaded successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'No images provided, invalid image format, file size exceeded, or maximum image limit reached.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async uploadImages(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: UploadedImageFile[],
  ) {
    const userId = req.user.id;

    if (!files?.length) {
      throw new BadRequestException(
        'Please provide at least one product image.',
      );
    }

    return this.productsService.uploadProductImages(userId, shopId, id, files);
  }

  @Patch(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Set a product image as the primary image' })
  setPrimaryImage(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productsService.setPrimaryProductImage(
      req.user.id,
      shopId,
      id,
      imageId,
    );
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Delete an image from a seller-owned product' })
  deleteImage(
    @Req() req: any,
    @Param('shopId', ParseUUIDPipe) shopId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productsService.deleteProductImage(
      req.user.id,
      shopId,
      id,
      imageId,
    );
  }
}
