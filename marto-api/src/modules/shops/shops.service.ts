import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Shop } from './entities/shop.entity';
import { UpdateShopDto } from './dto/update-shop.dto';

import { BadRequestException } from '@nestjs/common';

import {
  CloudinaryUploadService,
  UploadedCloudinaryImage,
} from '../../common/uploads/cloudinary-upload.service';

import { CLOUDINARY_FOLDERS } from '../../common/uploads/path.constants';
import { UploadedImageFile } from '../../common/uploads/upload-file.type';
import { ShopStatus } from 'src/common/enums/shop-status.enum';
import { DisabledBy } from 'src/common/enums/disable-by.enum';
import { UpdateShopStatusDto } from './dto/update-shop-status.dto';
import { ShopCategory } from '../shop-categories/entities/shop-category.entity';
import { ShopCategoryStatus } from 'src/common/enums/shop-category-status.enum';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    @InjectRepository(ShopCategory)
    private readonly shopCategoryRepository: Repository<ShopCategory>,

    private readonly cloudinaryUploadService: CloudinaryUploadService,
  ) {}

  async getMyShop(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        shopCategory: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    return shop;
  }

  async updateMyShop(userId: string, dto: UpdateShopDto) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        shopCategory: true,
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Update marketplace-level ShopCategory when a new ID is provided.
    if (dto.shop_category_id !== undefined && dto.shop_category_id !== null) {
      const selectedCategory = await this.shopCategoryRepository.findOne({
        where: {
          id: dto.shop_category_id,
        },
      });

      if (!selectedCategory) {
        throw new NotFoundException('Selected shop category not found.');
      }

      if (selectedCategory.status !== ShopCategoryStatus.ACTIVE) {
        throw new BadRequestException('Selected shop category is not active.');
      }

      const isOtherCategory = selectedCategory.slug.toLowerCase() === 'other';

      if (isOtherCategory) {
        const customCategoryName = dto.custom_category_name?.trim();

        if (!customCategoryName) {
          throw new BadRequestException(
            'Custom category name is required when selecting Other.',
          );
        }

        shop.custom_category_name = customCategoryName;
      } else {
        shop.custom_category_name = null;
      }

      shop.shopCategory = selectedCategory;
    } else if (
      dto.custom_category_name !== undefined &&
      dto.custom_category_name !== null
    ) {
      throw new BadRequestException(
        'Shop category ID is required when updating the custom category name.',
      );
    }

    // Update remaining shop profile fields.
    const { shop_category_id, custom_category_name, ...shopDetails } = dto;

    Object.assign(shop, shopDetails);

    const updatedShop = await this.shopRepository.save(shop);

    return updatedShop;
  }
  async updateMyShopImages(
    userId: string,
    files: {
      logo?: UploadedImageFile[];
      cover_image?: UploadedImageFile[];
    },
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    if (!files?.logo?.length && !files?.cover_image?.length) {
      throw new BadRequestException(
        'Please provide at least one image: logo or cover_image.',
      );
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Keep previous Cloudinary public IDs for cleanup after DB save.
    const previousLogoPublicId = shop.logo_public_id;
    const previousCoverPublicId = shop.cover_image_public_id;

    // Track newly uploaded images for cleanup if something fails.
    const uploadedImages: UploadedCloudinaryImage[] = [];

    try {
      // Upload new logo if provided.
      if (files.logo?.length) {
        const uploadedLogo = await this.cloudinaryUploadService.uploadImage(
          files.logo[0],
          CLOUDINARY_FOLDERS.SHOP_LOGOS,
        );

        uploadedImages.push(uploadedLogo);

        shop.logo_url = uploadedLogo.url;
        shop.logo_public_id = uploadedLogo.publicId;
      }

      // Upload new cover image if provided.
      if (files.cover_image?.length) {
        const uploadedCover = await this.cloudinaryUploadService.uploadImage(
          files.cover_image[0],
          CLOUDINARY_FOLDERS.SHOP_COVERS,
        );

        uploadedImages.push(uploadedCover);

        shop.cover_image_url = uploadedCover.url;
        shop.cover_image_public_id = uploadedCover.publicId;
      }

      // Save updated image details first.
      const updatedShop = await this.shopRepository.save(shop);

      // Delete previous images only after successful database save.
      const oldImagesToDelete: string[] = [];

      if (
        files.logo?.length &&
        previousLogoPublicId &&
        previousLogoPublicId !== shop.logo_public_id
      ) {
        oldImagesToDelete.push(previousLogoPublicId);
      }

      if (
        files.cover_image?.length &&
        previousCoverPublicId &&
        previousCoverPublicId !== shop.cover_image_public_id
      ) {
        oldImagesToDelete.push(previousCoverPublicId);
      }

      await Promise.all(
        oldImagesToDelete.map((publicId) =>
          this.cloudinaryUploadService.deleteImage(publicId),
        ),
      );

      return updatedShop;
    } catch (error) {
      // Remove newly uploaded images if upload or database save fails.
      await Promise.all(
        uploadedImages.map((image) =>
          this.cloudinaryUploadService.deleteImage(image.publicId),
        ),
      );

      throw error;
    }
  }

  async updateMyShopStatus(userId: string, dto: UpdateShopStatusDto) {
    if (!userId) {
      throw new UnauthorizedException('Authenticated user ID is missing.');
    }

    const shop = await this.shopRepository.findOne({
      where: {
        seller: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Seller wants to deactivate the shop.
    if (dto.status === ShopStatus.INACTIVE) {
      if (shop.status !== ShopStatus.ACTIVE) {
        throw new BadRequestException(
          'Only an active shop can be deactivated by the seller.',
        );
      }

      shop.status = ShopStatus.INACTIVE;
      shop.disabled_by = DisabledBy.SELLER;
    }

    // Seller wants to reactivate the shop.
    if (dto.status === ShopStatus.ACTIVE) {
      if (shop.status !== ShopStatus.INACTIVE) {
        throw new BadRequestException(
          'Only an inactive shop can be activated.',
        );
      }

      if (shop.disabled_by !== DisabledBy.SELLER) {
        throw new ForbiddenException(
          'This shop status was managed by the admin. Contact the admin to reactivate your shop.',
        );
      }

      shop.status = ShopStatus.ACTIVE;
      shop.disabled_by = null;
    }

    return this.shopRepository.save(shop);
  }
}
