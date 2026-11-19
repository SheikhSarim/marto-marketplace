import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductShopCategory } from './entities/product-shop-category.entity';
import { Category } from '../categories/entities/category.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Shop } from '../shops/entities/shop.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { ProductCategoryScope } from '../../common/enums/product-category-scope.enum';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { SellerStatus } from '../../common/enums/seller-status.enum';
import { ShopStatus } from '../../common/enums/shop-status.enum';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { ProductAvailability } from '../../common/enums/product-availability.enum';
import { DiscountType } from '../../common/enums/discount-type.enum';
import { DisabledBy } from '../../common/enums/disable-by.enum';
import { ProductSortBy } from '../../common/enums/product-sort-by.enum';
import { PaginationProvider } from '../../common/providers/pagination.provider';
import { CloudinaryUploadService } from '../../common/uploads/cloudinary-upload.service';
import { CLOUDINARY_FOLDERS } from '../../common/uploads/path.constants';
import type { UploadedImageFile } from '../../common/uploads/upload-file.type';

const MAX_PRODUCT_IMAGES = 8;

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    private readonly paginationProvider: PaginationProvider,
    private readonly cloudinaryUploadService: CloudinaryUploadService,
    private readonly dataSource: DataSource,
  ) {}

  private slugify(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string, sku: string, excludeId?: string): Promise<string> {
    const base = `${this.slugify(name)}-${this.slugify(sku)}`.replace(/-+/g, '-');
    if (!base) throw new BadRequestException('Product name or SKU must contain letters or numbers.');
    let slug = base;
    let suffix = 2;
    while (true) {
      const qb = this.productRepository.createQueryBuilder('product').where('product.slug = :slug', { slug });
      if (excludeId) qb.andWhere('product.id != :excludeId', { excludeId });
      if (!(await qb.getOne())) return slug;
      slug = `${base}-${suffix++}`;
    }
  }

  private async getSellerShop(userId: string, shopId: string): Promise<{ seller: Seller; shop: Shop }> {
    if (!userId) throw new ForbiddenException('Authenticated user ID is missing.');
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId }, shops: { id: shopId } },
      relations: { user: true, shops: true },
    });
    if (!seller) throw new NotFoundException('Shop not found or you do not own this shop.');
    if (seller.status !== SellerStatus.APPROVED || seller.approved !== true) {
      throw new ForbiddenException('Your seller account is not approved.');
    }
    const shop = seller.shops?.find((item) => item.id === shopId);
    if (!shop) throw new NotFoundException('Shop not found.');
    if (shop.status !== ShopStatus.ACTIVE) {
      throw new ForbiddenException('Only active shops can manage products.');
    }
    return { seller, shop };
  }

  private async getPlatformCategory(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, scope: ProductCategoryScope.PLATFORM },
      relations: { parent: true },
    });
    if (!category || category.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestException('Select an active marketplace product category.');
    }
    let parent = category.parent;
    while (parent) {
      if (parent.status !== CategoryStatus.ACTIVE) {
        throw new BadRequestException('The selected category belongs to a disabled category branch.');
      }
      parent = parent.parent
        ? await this.categoryRepository.findOne({ where: { id: parent.parent.id }, relations: { parent: true } })
        : null;
    }
    const hasActiveChildren = await this.categoryRepository.exist({
      where: { parent: { id: category.id }, status: CategoryStatus.ACTIVE },
    });
    if (hasActiveChildren) {
      throw new BadRequestException('Products must be assigned to an active leaf category.');
    }
    return category;
  }

  private async getShopCategories(shopId: string, ids?: string[] | null): Promise<Category[]> {
    if (!ids?.length) return [];
    const uniqueIds = [...new Set(ids)];
    const categories = await this.categoryRepository.find({
      where: {
        id: In(uniqueIds),
        scope: ProductCategoryScope.SHOP,
        shop: { id: shopId },
        status: CategoryStatus.ACTIVE,
      },
      relations: { shop: true, parent: true },
    });
    if (categories.length !== uniqueIds.length) {
      throw new BadRequestException('One or more collections are invalid, inactive, or do not belong to this shop.');
    }
    for (const category of categories) {
      let parent = category.parent;
      while (parent) {
        if (parent.status !== CategoryStatus.ACTIVE) {
          throw new BadRequestException(`Collection "${category.name}" belongs to a disabled collection branch.`);
        }
        parent = parent.parent
          ? await this.categoryRepository.findOne({ where: { id: parent.parent.id }, relations: { parent: true } })
          : null;
      }
    }
    return categories;
  }

  private validatePricing(dto: {
    price?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    sale_starts_at?: string | null;
    sale_ends_at?: string | null;
  }, existing?: Product): { price: number; discountType: DiscountType; discountValue: number; finalPrice: number; startsAt: Date | null; endsAt: Date | null } {
    const price = dto.price ?? existing?.price;
    if (price === undefined || price <= 0) throw new BadRequestException('Product price must be greater than zero.');
    const discountType = dto.discount_type ?? existing?.discount_type ?? DiscountType.NONE;
    const discountValue = dto.discount_value ?? existing?.discount_value ?? 0;
    if (discountValue < 0) throw new BadRequestException('Discount value cannot be negative.');
    let finalPrice = price;
    if (discountType === DiscountType.NONE) {
      if (discountValue !== 0) throw new BadRequestException('Discount value must be zero when discount_type is NONE.');
    } else if (discountType === DiscountType.PERCENTAGE) {
      if (discountValue <= 0 || discountValue > 100) throw new BadRequestException('Percentage discount must be greater than 0 and at most 100.');
      finalPrice = price * (1 - discountValue / 100);
    } else if (discountType === DiscountType.FIXED) {
      if (discountValue <= 0 || discountValue >= price) throw new BadRequestException('Fixed discount must be greater than zero and less than the product price.');
      finalPrice = price - discountValue;
    }
    const startsAt = dto.sale_starts_at !== undefined
      ? (dto.sale_starts_at ? new Date(dto.sale_starts_at) : null)
      : existing?.sale_starts_at ?? null;
    const endsAt = dto.sale_ends_at !== undefined
      ? (dto.sale_ends_at ? new Date(dto.sale_ends_at) : null)
      : existing?.sale_ends_at ?? null;
    if (startsAt && endsAt && startsAt >= endsAt) {
      throw new BadRequestException('sale_starts_at must be earlier than sale_ends_at.');
    }
    return { price, discountType, discountValue, finalPrice: Number(finalPrice.toFixed(2)), startsAt, endsAt };
  }

  private async ensureSkuAvailable(shopId: string, sku: string, excludeId?: string): Promise<void> {
    const qb = this.productRepository.createQueryBuilder('product')
      .where('product.shop_id = :shopId', { shopId })
      .andWhere('LOWER(product.sku) = LOWER(:sku)', { sku });
    if (excludeId) qb.andWhere('product.id != :excludeId', { excludeId });
    if (await qb.getOne()) throw new ConflictException('A product with this SKU already exists in this shop.');
  }

  private productResponse(product: Product) {
    return {
      id: product.id,
      shop: product.shop ? { id: product.shop.id, name: product.shop.name } : null,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      brand: product.brand,
      primary_category: product.primaryCategory ? {
        id: product.primaryCategory.id,
        name: product.primaryCategory.name,
        slug: product.primaryCategory.slug,
      } : null,
      shop_categories: (product.shopCategoryAssignments ?? [])
        .filter(({ category }) => category.status === CategoryStatus.ACTIVE)
        .map(({ category }) => ({ id: category.id, name: category.name, slug: category.slug })),
      price: product.price,
      discount_type: product.discount_type,
      discount_value: product.discount_value,
      sale_starts_at: product.sale_starts_at,
      sale_ends_at: product.sale_ends_at,
      final_price: product.final_price,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      availability: product.stock_quantity > 0 ? ProductAvailability.IN_STOCK : ProductAvailability.OUT_OF_STOCK,
      weight: product.weight,
      is_prepaid_only: product.is_prepaid_only,
      tags: product.tags,
      status: product.status,
      disabled_by: product.disabled_by,
      rating_avg: product.rating_avg,
      rating_count: product.rating_count,
      sold_count: product.sold_count,
      images: (product.images ?? []).sort((a, b) => a.sort_order - b.sort_order).map((image) => ({
        id: image.id, url: image.url, is_primary: image.is_primary, sort_order: image.sort_order,
      })),
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  async createSellerProduct(userId: string, shopId: string, dto: CreateProductDto) {
    const { seller, shop } = await this.getSellerShop(userId, shopId);
    await this.ensureSkuAvailable(shopId, dto.sku);
    const primaryCategory = await this.getPlatformCategory(dto.primary_category_id);
    const shopCategories = await this.getShopCategories(shopId, dto.shop_category_ids);
    const pricing = this.validatePricing(dto);
    const slug = await this.generateUniqueSlug(dto.name, dto.sku);
    const stock = dto.stock_quantity ?? 0;
    const product = this.productRepository.create({
      seller,
      shop,
      primaryCategory,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || null,
      sku: dto.sku.trim(),
      brand: dto.brand?.trim() || null,
      price: pricing.price,
      discount_type: pricing.discountType,
      discount_value: pricing.discountValue,
      sale_starts_at: pricing.startsAt,
      sale_ends_at: pricing.endsAt,
      final_price: pricing.finalPrice,
      stock_quantity: stock,
      low_stock_threshold: dto.low_stock_threshold ?? 5,
      weight: dto.weight ?? null,
      is_prepaid_only: dto.is_prepaid_only ?? false,
      tags: (dto.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      status: stock > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
      disabled_by: null,
    });
    const saved = await this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const assignmentRepo = manager.getRepository(ProductShopCategory);
      const created = await productRepo.save(product);
      if (shopCategories.length) {
        await assignmentRepo.save(shopCategories.map((category) => assignmentRepo.create({
          productId: created.id,
          categoryId: category.id,
        })));
      }
      return productRepo.findOneOrFail({
        where: { id: created.id },
        relations: { shop: true, primaryCategory: true, images: true, shopCategoryAssignments: { category: true } },
      });
    });
    return { success: true, message: 'Product created successfully.', data: this.productResponse(saved) };
  }

  async updateSellerProduct(userId: string, shopId: string, productId: string, dto: UpdateProductDto) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
      relations: { shop: true, seller: true, primaryCategory: true, images: true, shopCategoryAssignments: { category: true } },
    });
    if (!product || product.status === ProductStatus.REMOVED) throw new NotFoundException('Product not found.');
    if (dto.sku !== undefined) await this.ensureSkuAvailable(shopId, dto.sku, product.id);
    const primaryCategory = dto.primary_category_id
      ? await this.getPlatformCategory(dto.primary_category_id)
      : product.primaryCategory;
    const shopCategories = dto.shop_category_ids !== undefined
      ? await this.getShopCategories(shopId, dto.shop_category_ids)
      : undefined;
    const pricing = this.validatePricing(dto, product);
    const nextName = dto.name?.trim() ?? product.name;
    const nextSku = dto.sku?.trim() ?? product.sku;
    Object.assign(product, {
      name: nextName,
      slug: dto.name !== undefined || dto.sku !== undefined
        ? await this.generateUniqueSlug(nextName, nextSku, product.id)
        : product.slug,
      description: dto.description !== undefined ? (dto.description?.trim() || null) : product.description,
      sku: nextSku,
      brand: dto.brand !== undefined ? (dto.brand?.trim() || null) : product.brand,
      primaryCategory,
      price: pricing.price,
      discount_type: pricing.discountType,
      discount_value: pricing.discountValue,
      sale_starts_at: pricing.startsAt,
      sale_ends_at: pricing.endsAt,
      final_price: pricing.finalPrice,
      stock_quantity: dto.stock_quantity ?? product.stock_quantity,
      low_stock_threshold: dto.low_stock_threshold ?? product.low_stock_threshold,
      weight: dto.weight ?? product.weight,
      is_prepaid_only: dto.is_prepaid_only ?? product.is_prepaid_only,
      tags: dto.tags !== undefined ? (dto.tags ?? []).map((tag) => tag.trim()).filter(Boolean) : product.tags,
    });
    if (product.status === ProductStatus.OUT_OF_STOCK && product.stock_quantity > 0) product.status = ProductStatus.ACTIVE;
    if (product.status === ProductStatus.ACTIVE && product.stock_quantity === 0) product.status = ProductStatus.OUT_OF_STOCK;

    const saved = await this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const assignmentRepo = manager.getRepository(ProductShopCategory);
      await productRepo.save(product);
      if (shopCategories !== undefined) {
        await assignmentRepo.delete({ productId: product.id });
        if (shopCategories.length) {
          await assignmentRepo.save(shopCategories.map((category) => assignmentRepo.create({
            productId: product.id,
            categoryId: category.id,
          })));
        }
      }
      return productRepo.findOneOrFail({
        where: { id: product.id },
        relations: { shop: true, primaryCategory: true, images: true, shopCategoryAssignments: { category: true } },
      });
    });
    return { success: true, message: 'Product updated successfully.', data: this.productResponse(saved) };
  }

  async updateSellerProductStatus(userId: string, shopId: string, productId: string, dto: UpdateProductStatusDto) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
    });
    if (!product || product.status === ProductStatus.REMOVED) throw new NotFoundException('Product not found.');
    if (product.disabled_by === DisabledBy.ADMIN) {
      throw new ForbiddenException('This product was disabled by Admin. Its status can only be changed by Admin.');
    }
    if (dto.status === ProductStatus.ACTIVE && product.stock_quantity === 0) {
      throw new BadRequestException('Add available stock before activating this product.');
    }
    product.status = dto.status;
    product.disabled_by = dto.status === ProductStatus.DISABLED ? DisabledBy.SELLER : null;
    await this.productRepository.save(product);
    return { success: true, message: 'Product status updated successfully.', data: { id: product.id, status: product.status, disabled_by: product.disabled_by } };
  }

  async findSellerProducts(userId: string, shopId: string, query: ProductQueryDto) {
    const { seller } = await this.getSellerShop(userId, shopId);
    if (query.min_price !== undefined && query.max_price !== undefined && query.min_price > query.max_price) {
      throw new BadRequestException('min_price cannot be greater than max_price.');
    }
    const qb = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('product.primaryCategory', 'primaryCategory')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.shopCategoryAssignments', 'assignments')
      .leftJoinAndSelect('assignments.category', 'shopCategory')
      .where('product.shop_id = :shopId', { shopId })
      .andWhere('product.seller_id = :sellerId', { sellerId: seller.id })
      .andWhere('product.status != :removed', { removed: ProductStatus.REMOVED });
    if (query.status) qb.andWhere('product.status = :status', { status: query.status });
    if (query.primary_category_id) qb.andWhere('product.primary_category_id = :categoryId', { categoryId: query.primary_category_id });
    if (query.shop_category_id) qb.andWhere('shopCategory.id = :shopCategoryId', { shopCategoryId: query.shop_category_id });
    if (query.availability === ProductAvailability.IN_STOCK) qb.andWhere('product.stock_quantity > 0');
    if (query.availability === ProductAvailability.OUT_OF_STOCK) qb.andWhere('product.stock_quantity = 0');
    if (query.min_price !== undefined) qb.andWhere('product.final_price >= :minPrice', { minPrice: query.min_price });
    if (query.max_price !== undefined) qb.andWhere('product.final_price <= :maxPrice', { maxPrice: query.max_price });
    const result = await this.paginationProvider.paginate(qb, query, {
      searchFields: ['product.name', 'product.sku', 'product.brand', 'product.description'],
      allowedSortFields: Object.values(ProductSortBy),
      defaultSortField: ProductSortBy.CREATED_AT,
      defaultSortOrder: 'DESC',
      secondarySortField: 'product.id',
    });
    return {
      success: true,
      data: result.data.map((product) => this.productResponse(product)),
      meta: result.meta,
    };
  }

  async findSellerProduct(userId: string, shopId: string, productId: string) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
      relations: { shop: true, primaryCategory: true, images: true, shopCategoryAssignments: { category: true } },
    });
    if (!product || product.status === ProductStatus.REMOVED) throw new NotFoundException('Product not found.');
    return { success: true, data: this.productResponse(product) };
  }

  async removeSellerProduct(userId: string, shopId: string, productId: string) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
    });
    if (!product || product.status === ProductStatus.REMOVED) throw new NotFoundException('Product not found.');
    product.status = ProductStatus.REMOVED;
    product.disabled_by = null;
    await this.productRepository.save(product);
    return { success: true, message: 'Product removed successfully.' };
  }

  async uploadProductImages(userId: string, shopId: string, productId: string, files: UploadedImageFile[]) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
      relations: { images: true },
    });
    if (!product || product.status === ProductStatus.REMOVED) throw new NotFoundException('Product not found.');
    if (!files?.length) throw new BadRequestException('Please provide at least one product image.');
    if (product.images.length + files.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(`A product can have a maximum of ${MAX_PRODUCT_IMAGES} images.`);
    }
    const uploaded: Array<{ url: string; publicId: string }> = [];
    try {
      for (const file of files) uploaded.push(await this.cloudinaryUploadService.uploadImage(file, CLOUDINARY_FOLDERS.PRODUCT_IMAGES));
      const startOrder = product.images.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1;
      const images = uploaded.map((asset, index) => this.imageRepository.create({
        product,
        url: asset.url,
        public_id: asset.publicId,
        is_primary: product.images.length === 0 && index === 0,
        sort_order: startOrder + index,
      }));
      await this.imageRepository.save(images);
    } catch (error) {
      await Promise.all(uploaded.map((asset) => this.cloudinaryUploadService.deleteImage(asset.publicId)));
      throw error;
    }
    return this.findSellerProduct(userId, shopId, productId);
  }

  async deleteProductImage(userId: string, shopId: string, productId: string, imageId: string) {
    await this.getSellerShop(userId, shopId);
    const image = await this.imageRepository.findOne({
      where: { id: imageId, product: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } } },
      relations: { product: true },
    });
    if (!image) throw new NotFoundException('Product image not found.');
    await this.imageRepository.remove(image);
    await this.cloudinaryUploadService.deleteImage(image.public_id);
    if (image.is_primary) {
      const nextImage = await this.imageRepository.findOne({
        where: { product: { id: productId } },
        order: { sort_order: 'ASC' },
      });
      if (nextImage) {
        nextImage.is_primary = true;
        await this.imageRepository.save(nextImage);
      }
    }
    return { success: true, message: 'Product image deleted successfully.' };
  }

  async setPrimaryProductImage(userId: string, shopId: string, productId: string, imageId: string) {
    await this.getSellerShop(userId, shopId);
    const product = await this.productRepository.findOne({
      where: { id: productId, shop: { id: shopId }, seller: { user: { id: userId } } },
    });
    if (!product) throw new NotFoundException('Product not found.');
    const image = await this.imageRepository.findOne({ where: { id: imageId, product: { id: productId } } });
    if (!image) throw new NotFoundException('Product image not found.');
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(ProductImage).createQueryBuilder()
        .update(ProductImage)
        .set({ is_primary: false })
        .where('product_id = :productId', { productId })
        .execute();
      await manager.getRepository(ProductImage).update({ id: imageId }, { is_primary: true });
    });
    return { success: true, message: 'Primary product image updated successfully.' };
  }

  private async isPublicCategory(category: Category): Promise<boolean> {
    let current: Category | null = category;
    while (current) {
      if (current.scope !== ProductCategoryScope.PLATFORM || current.status !== CategoryStatus.ACTIVE) return false;
      current = current.parent
        ? await this.categoryRepository.findOne({ where: { id: current.parent.id }, relations: { parent: true } })
        : null;
    }
    return true;
  }

  async findPublicProducts(query: ProductQueryDto) {
    if (query.min_price !== undefined && query.max_price !== undefined && query.min_price > query.max_price) {
      throw new BadRequestException('min_price cannot be greater than max_price.');
    }
    const qb = this.productRepository.createQueryBuilder('product')
      .innerJoin('product.seller', 'seller', 'seller.status = :sellerStatus AND seller.approved = true', { sellerStatus: SellerStatus.APPROVED })
      .innerJoinAndSelect('product.shop', 'shop', 'shop.status = :shopStatus', { shopStatus: ShopStatus.ACTIVE })
      .innerJoinAndSelect('product.primaryCategory', 'primaryCategory', 'primaryCategory.scope = :scope AND primaryCategory.status = :categoryStatus', { scope: ProductCategoryScope.PLATFORM, categoryStatus: CategoryStatus.ACTIVE })
      .leftJoinAndSelect('product.images', 'images')
      .where('product.status IN (:...statuses)', { statuses: [ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK] })
      .andWhere(`NOT EXISTS (
        WITH RECURSIVE category_ancestors AS (
          SELECT id, parent_id, status FROM categories WHERE id = product.primary_category_id
          UNION ALL
          SELECT parent_category.id, parent_category.parent_id, parent_category.status
          FROM categories parent_category
          INNER JOIN category_ancestors child_category ON child_category.parent_id = parent_category.id
        )
        SELECT 1 FROM category_ancestors WHERE status != :activeCategoryStatus
      )`, { activeCategoryStatus: CategoryStatus.ACTIVE });
    if (query.primary_category_id) {
      qb.andWhere(`product.primary_category_id IN (
        WITH RECURSIVE category_tree AS (
          SELECT id FROM categories
          WHERE id = :categoryId AND scope = :treeScope AND status = :treeActive
          UNION ALL
          SELECT child.id FROM categories child
          INNER JOIN category_tree parent ON child.parent_id = parent.id
          WHERE child.scope = :treeScope AND child.status = :treeActive
        )
        SELECT id FROM category_tree
      )`, {
        categoryId: query.primary_category_id,
        treeScope: ProductCategoryScope.PLATFORM,
        treeActive: CategoryStatus.ACTIVE,
      });
    }
    if (query.availability === ProductAvailability.IN_STOCK) qb.andWhere('product.stock_quantity > 0');
    if (query.availability === ProductAvailability.OUT_OF_STOCK) qb.andWhere('product.stock_quantity = 0');
    if (query.min_price !== undefined) qb.andWhere('product.final_price >= :minPrice', { minPrice: query.min_price });
    if (query.max_price !== undefined) qb.andWhere('product.final_price <= :maxPrice', { maxPrice: query.max_price });
    const result = await this.paginationProvider.paginate(qb, query, {
      searchFields: ['product.name', 'product.brand', 'product.description'],
      allowedSortFields: Object.values(ProductSortBy),
      defaultSortField: ProductSortBy.CREATED_AT,
      defaultSortOrder: 'DESC',
      secondarySortField: 'product.id',
    });
    return {
      success: true,
      data: result.data.map((product) => this.productResponse(product)),
      meta: result.meta,
    };
  }

  async findPublicProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        status: In([ProductStatus.ACTIVE, ProductStatus.OUT_OF_STOCK]),
        seller: { status: SellerStatus.APPROVED, approved: true },
        shop: { status: ShopStatus.ACTIVE },
        primaryCategory: { scope: ProductCategoryScope.PLATFORM, status: CategoryStatus.ACTIVE },
      },
      relations: { shop: true, seller: true, primaryCategory: { parent: true }, images: true, shopCategoryAssignments: { category: true } },
    });
    if (!product || !(await this.isPublicCategory(product.primaryCategory))) throw new NotFoundException('Product not found.');
    return { success: true, data: this.productResponse(product) };
  }
}
