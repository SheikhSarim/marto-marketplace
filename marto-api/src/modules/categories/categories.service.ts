import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { Seller } from '../sellers/entities/seller.entity';

import { CreateCategoryDto } from './dto/create-category.dto';

import { CategoryStatus } from '../../common/enums/category-status.enum';
import { SellerStatus } from '../../common/enums/seller-status.enum';
import { ShopStatus } from '../shops/entities/shop.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  // Convert category name into URL-friendly slug.
  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Standard category API response.
  private toCategoryResponse(
    category: Category,
    productsCount?: number,
  ) {
    const categoryWithCount = category as Category & {
      products_count?: number;
    };

    return {
      id: category.id,

      seller: category.seller
        ? {
            id: category.seller.id,
            business_name: category.seller.business_name,
          }
        : null,

      parent: category.parent
        ? {
            id: category.parent.id,
            name: category.parent.name,
            slug: category.parent.slug,
          }
        : null,

      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,

      status: category.status,
      disabled_by: category.disabled_by,

      sort_order: category.sort_order,

      products_count:
        productsCount ??
        categoryWithCount.products_count ??
        0,

      ...(category.children !== undefined && {
        children: category.children.map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          status: child.status,
        })),
      }),

      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  // Verify seller approval and active shop.
  private async getApprovedSeller(userId: string): Promise<Seller> {
    if (!userId) {
      throw new ForbiddenException(
        'Authenticated user ID is missing.',
      );
    }

    const seller = await this.sellerRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: {
        shops: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found.');
    }

    if (
      seller.status !== SellerStatus.APPROVED ||
      seller.approved !== true
    ) {
      throw new ForbiddenException(
        'Your seller account is not approved.',
      );
    }

    const activeShop = seller.shops?.some(
      (shop) => shop.status === ShopStatus.ACTIVE,
    );

    if (!activeShop) {
      throw new ForbiddenException(
        'You need an active shop to manage categories.',
      );
    }

    return seller;
  }

  // Generate a unique slug within the seller's categories.
  private async generateUniqueSlug(
    name: string,
    sellerId: string,
  ): Promise<string> {
    const baseSlug = this.slugify(name);

    if (!baseSlug) {
      throw new BadRequestException(
        'Category name is invalid.',
      );
    }

    let slug = baseSlug;
    let suffix = 2;

    while (
      await this.categoryRepository.findOne({
        where: {
          seller: { id: sellerId },
          slug,
        },
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    return slug;
  }

  // Validate parent category and prevent circular hierarchy.
  private async validateParent(
    parentId: string | undefined,
    sellerId: string,
    currentCategoryId?: string,
  ): Promise<Category | null> {
    if (!parentId) {
      return null;
    }

    if (currentCategoryId && parentId === currentCategoryId) {
      throw new BadRequestException(
        'A category cannot be its own parent.',
      );
    }

    const parent = await this.categoryRepository.findOne({
      where: {
        id: parentId,
        seller: { id: sellerId },
      },
      relations: {
        parent: true,
      },
    });

    if (!parent || parent.status === CategoryStatus.REMOVED) {
      throw new BadRequestException(
        'Parent category is invalid.',
      );
    }

    // Traverse ancestors to prevent circular hierarchy.
    let ancestor: Category | null = parent;

    const visited = new Set<string>();

    while (ancestor) {
      if (ancestor.id === currentCategoryId) {
        throw new BadRequestException(
          'Invalid parent category: circular hierarchy detected.',
        );
      }

      if (visited.has(ancestor.id)) {
        throw new BadRequestException(
          'Invalid parent category: circular hierarchy detected.',
        );
      }

      visited.add(ancestor.id);

      if (!ancestor.parent) {
        break;
      }

      ancestor = await this.categoryRepository.findOne({
        where: {
          id: ancestor.parent.id,
          seller: { id: sellerId },
        },
        relations: {
          parent: true,
        },
      });

      if (
        !ancestor ||
        ancestor.status === CategoryStatus.REMOVED
      ) {
        throw new BadRequestException(
          'Parent category is invalid.',
        );
      }
    }

    return parent;
  }

  // CREATE CATEGORY
  async create(userId: string, dto: CreateCategoryDto) {
    const seller = await this.getApprovedSeller(userId);

    const parent = await this.validateParent(
      dto.parent_id,
      seller.id,
    );

    const slug = await this.generateUniqueSlug(
      dto.name,
      seller.id,
    );

    const category = this.categoryRepository.create({
      seller,
      parent,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() ?? null,
      sort_order: dto.sort_order ?? 0,
      status: CategoryStatus.ACTIVE,
      disabled_by: null,
    });

    const saved = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully.',
      data: this.toCategoryResponse(saved, 0),
    };
  }
}