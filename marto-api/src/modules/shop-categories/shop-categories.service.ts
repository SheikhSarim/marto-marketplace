
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateShopCategoryDto } from './dto/create-shop-category.dto';
import { ShopCategory } from './entities/shop-category.entity';
import { ShopCategoryStatus } from '../../common/enums/shop-category-status.enum';

@Injectable()
export class ShopCategoriesService {
  private readonly logger = new Logger(ShopCategoriesService.name);

  constructor(
    @InjectRepository(ShopCategory)
    private readonly shopCategoryRepository: Repository<ShopCategory>,
  ) {}

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateShopCategoryDto) {
    const name = dto.name.trim();
    const slug = this.slugify(name);

    if (!slug) {
      throw new BadRequestException(
        'Shop category name must contain at least one English letter or number.',
      );
    }

    const existing = await this.shopCategoryRepository.findOne({
      where: [{ name }, { slug }],
    });

    if (existing) {
      throw new ConflictException(
        'A shop category with this name already exists.',
      );
    }

    const shopCategory = this.shopCategoryRepository.create({
      name,
      slug,
      description: dto.description?.trim() || null,
      image_url: null,
      image_public_id: null,
      status: ShopCategoryStatus.ACTIVE,
    });

    try {
      const saved = await this.shopCategoryRepository.save(shopCategory);
      this.logger.log(`Shop category created. ID: ${saved.id}`);

      return {
        success: true,
        message: 'Shop category created successfully.',
        data: saved,
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'A shop category with this name already exists.',
        );
      }

      throw error;
    }
  }
}
