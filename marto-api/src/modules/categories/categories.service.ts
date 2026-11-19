import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  IsNull,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Shop } from '../shops/entities/shop.entity';
import { ProductShopCategory } from '../products/entities/product-shop-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { AdminCategoryQueryDto } from './dto/admin-category-query.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { PaginationProvider } from '../../common/providers/pagination.provider';
import { PaginatedResult } from '../../common/interface/paginated.interface';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { ProductStatus } from '../../common/enums/product-status.enum';
import { DisabledBy } from '../../common/enums/disable-by.enum';
import { SellerStatus } from '../../common/enums/seller-status.enum';
import { ShopStatus } from '../../common/enums/shop-status.enum';
import { ProductCategoryScope } from '../../common/enums/product-category-scope.enum';

const MAX_CATEGORY_DEPTH = 5;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(ProductShopCategory)
    private readonly assignmentRepository: Repository<ProductShopCategory>,
    private readonly paginationProvider: PaginationProvider,
    private readonly dataSource: DataSource,
  ) {}

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(
    name: string,
    scope: ProductCategoryScope,
    shopId?: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = this.slugify(name);
    if (!baseSlug)
      throw new BadRequestException(
        'Category name must contain letters or numbers.',
      );
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const qb = this.categoryRepository
        .createQueryBuilder('category')
        .where('category.scope = :scope', { scope })
        .andWhere('category.slug = :slug', { slug });
      if (scope === ProductCategoryScope.SHOP)
        qb.andWhere('category.shop_id = :shopId', { shopId });
      else qb.andWhere('category.shop_id IS NULL');
      if (excludeId) qb.andWhere('category.id != :excludeId', { excludeId });
      if (!(await qb.getOne())) return slug;
      slug = `${baseSlug}-${suffix++}`;
    }
  }

  private async getApprovedSellerShop(
    userId: string,
    shopId: string,
  ): Promise<{ seller: Seller; shop: Shop }> {
    if (!userId)
      throw new ForbiddenException('Authenticated user ID is missing.');
    const seller = await this.sellerRepository.findOne({
      where: { user: { id: userId }, shops: { id: shopId } },
      relations: { user: true, shops: true },
    });
    if (!seller)
      throw new NotFoundException(
        'Shop not found or you do not own this shop.',
      );
    if (seller.status !== SellerStatus.APPROVED || seller.approved !== true) {
      throw new ForbiddenException('Your seller account is not approved.');
    }
    const shop = seller.shops?.find((item) => item.id === shopId);
    if (!shop) throw new NotFoundException('Shop not found.');
    if (shop.status !== ShopStatus.ACTIVE)
      throw new ForbiddenException(
        'Only active shops can manage product collections.',
      );
    return { seller, shop };
  }

  private async getShopCategory(
    shopId: string,
    categoryId: string,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        scope: ProductCategoryScope.SHOP,
        shop: { id: shopId },
      },
      relations: { shop: true, parent: true },
    });
    if (!category || category.status === CategoryStatus.REMOVED)
      throw new NotFoundException('Product collection not found.');
    return category;
  }

  private async getPlatformCategory(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        scope: ProductCategoryScope.PLATFORM,
        shop: IsNull(),
      },
      relations: { parent: true },
    });
    if (!category || category.status === CategoryStatus.REMOVED)
      throw new NotFoundException('Platform category not found.');
    return category;
  }

  private async getParent(
    parentId: string | undefined,
    scope: ProductCategoryScope,
    shopId?: string,
    currentId?: string,
  ): Promise<Category | null> {
    if (!parentId) return null;
    if (currentId && parentId === currentId)
      throw new BadRequestException('A category cannot be its own parent.');
    const parent = await this.categoryRepository.findOne({
      where:
        scope === ProductCategoryScope.PLATFORM
          ? { id: parentId, scope, shop: IsNull() }
          : { id: parentId, scope, shop: { id: shopId } },
      relations: { parent: true },
    });
    if (!parent || parent.status !== CategoryStatus.ACTIVE)
      throw new BadRequestException(
        'Parent category must be active and belong to the same category scope and owner.',
      );

    const visited = new Set<string>();
    let cursor: Category | null = parent;
    let parentDepth = 1;
    while (cursor) {
      if (cursor.id === currentId || visited.has(cursor.id))
        throw new BadRequestException('Circular category hierarchy detected.');
      visited.add(cursor.id);
      if (!cursor.parent) break;
      cursor = await this.categoryRepository.findOne({
        where:
          scope === ProductCategoryScope.PLATFORM
            ? { id: cursor.parent.id, scope, shop: IsNull() }
            : { id: cursor.parent.id, scope, shop: { id: shopId } },
        relations: { parent: true },
      });
      if (!cursor || cursor.status !== CategoryStatus.ACTIVE) {
        throw new BadRequestException(
          'Parent hierarchy contains a missing or disabled category.',
        );
      }
      parentDepth++;
    }
    if (
      parentDepth +
        1 +
        (currentId ? await this.getSubtreeHeight(currentId) : 0) >
      MAX_CATEGORY_DEPTH
    ) {
      throw new BadRequestException(
        `Category hierarchy cannot exceed ${MAX_CATEGORY_DEPTH} levels.`,
      );
    }
    return parent;
  }

  private async getSubtreeHeight(categoryId: string): Promise<number> {
    let frontier = [categoryId];
    let height = 0;
    while (frontier.length) {
      const children = await this.categoryRepository
        .createQueryBuilder('category')
        .select('category.id', 'id')
        .where('category.parent_id IN (:...ids)', { ids: frontier })
        .andWhere('category.status != :removed', {
          removed: CategoryStatus.REMOVED,
        })
        .getRawMany<{ id: string }>();
      if (!children.length) break;
      height++;
      frontier = children.map((child) => child.id);
      if (height > MAX_CATEGORY_DEPTH) break;
    }
    return height;
  }

  private async validateDateRange(query: CategoryQueryDto): Promise<void> {
    if (
      query.created_from &&
      query.created_to &&
      new Date(query.created_from) > new Date(query.created_to)
    ) {
      throw new BadRequestException(
        'created_from cannot be later than created_to.',
      );
    }
  }

  private async countCategoryProducts(category: Category): Promise<number> {
    if (category.scope === ProductCategoryScope.PLATFORM) {
      return this.productRepository.count({
        where: {
          primaryCategory: { id: category.id },
          status: Not(ProductStatus.REMOVED),
        },
      });
    }
    return this.assignmentRepository
      .createQueryBuilder('assignment')
      .innerJoin('assignment.product', 'product')
      .where('assignment.category_id = :categoryId', {
        categoryId: category.id,
      })
      .andWhere('product.status != :removed', {
        removed: ProductStatus.REMOVED,
      })
      .getCount();
  }

  private toResponse(category: Category, productsCount?: number) {
    const row = category as Category & { products_count?: number };
    return {
      id: category.id,
      scope: category.scope,
      shop: category.shop
        ? { id: category.shop.id, name: category.shop.name }
        : null,
      legacy_seller: category.seller
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
      products_count: productsCount ?? row.products_count ?? 0,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  private async createCategory(
    scope: ProductCategoryScope,
    dto: CreateCategoryDto,
    shop?: Shop,
  ) {
    const parent = await this.getParent(dto.parent_id, scope, shop?.id);
    const slug = await this.generateUniqueSlug(dto.name, scope, shop?.id);
    const category = this.categoryRepository.create({
      scope,
      shop: shop ?? null,
      seller: null,
      parent,
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim() || null,
      image_url: dto.image_url ?? null,
      image_public_id: null,
      sort_order: dto.sort_order ?? 0,
      status: CategoryStatus.ACTIVE,
      disabled_by: null,
    });
    const saved = await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Product category created successfully.',
      data: this.toResponse(saved, 0),
    };
  }

  async createPlatformCategory(dto: CreateCategoryDto) {
    return this.createCategory(ProductCategoryScope.PLATFORM, dto);
  }

  async createShopCategory(
    userId: string,
    shopId: string,
    dto: CreateCategoryDto,
  ) {
    const { shop } = await this.getApprovedSellerShop(userId, shopId);
    return this.createCategory(ProductCategoryScope.SHOP, dto, shop);
  }

  private applyCategoryFilters(qb: any, query: CategoryQueryDto) {
    if (query.status)
      qb.andWhere('category.status = :status', { status: query.status });
    else
      qb.andWhere('category.status != :removed', {
        removed: CategoryStatus.REMOVED,
      });
    if (query.root === true || query.parent_id === 'null')
      qb.andWhere('category.parent_id IS NULL');
    else if (query.parent_id)
      qb.andWhere('category.parent_id = :parentId', {
        parentId: query.parent_id,
      });
    if (query.created_from)
      qb.andWhere('category.created_at >= :createdFrom', {
        createdFrom: query.created_from,
      });
    if (query.created_to)
      qb.andWhere(
        `category.created_at < (CAST(:createdTo AS date) + INTERVAL '1 day')`,
        { createdTo: query.created_to },
      );
  }

  private async paginateCategories(
    qb: SelectQueryBuilder<Category>,
    query: CategoryQueryDto,
  ): Promise<PaginatedResult<Category>> {
    await this.validateDateRange(query);
    const sortMap: Record<string, string> = {
      sort_order: 'category.sort_order',
      name: 'category.name',
      created_at: 'category.created_at',
      updated_at: 'category.updated_at',
    };
    const sortBy = sortMap[query.sortBy ?? ''] ?? 'category.sort_order';
    const result = await this.paginationProvider.paginate(
      qb,
      { ...query, sortBy },
      {
        allowedSortFields: Object.values(sortMap),
        defaultSortField: 'category.sort_order',
        defaultSortOrder: 'ASC',
        secondarySortField: 'category.id',
      },
    );
    return result;
  }

  async findShopCategories(
    userId: string,
    shopId: string,
    query: CategoryQueryDto,
  ) {
    await this.getApprovedSellerShop(userId, shopId);
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.shop', 'shop')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.scope = :scope', { scope: ProductCategoryScope.SHOP })
      .andWhere('category.shop_id = :shopId', { shopId });
    this.applyCategoryFilters(qb, query);
    qb.loadRelationCountAndMap(
      'category.products_count',
      'category.productAssignments',
      'assignment',
      (assignmentQuery) =>
        assignmentQuery
          .innerJoin('assignment.product', 'assignedProduct')
          .andWhere('assignedProduct.status != :removedProduct', {
            removedProduct: ProductStatus.REMOVED,
          })
          .andWhere('assignedProduct.deleted_at IS NULL'),
    );
    const result = await this.paginateCategories(qb, query);
    return {
      success: true,
      message: 'Shop product collections fetched successfully.',
      data: result.data.map((item) => this.toResponse(item)),
      meta: result.meta,
    };
  }

  async findAdminCategories(query: AdminCategoryQueryDto) {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.shop', 'shop')
      .leftJoin('shop.seller', 'shopSeller')
      .leftJoinAndSelect('category.seller', 'seller')
      .leftJoinAndSelect('category.parent', 'parent');
    if (query.seller_id)
      qb.andWhere('(shopSeller.id = :sellerId OR seller.id = :sellerId)', {
        sellerId: query.seller_id,
      });
    if (query.scope)
      qb.andWhere('category.scope = :scope', { scope: query.scope });
    if (query.shop_id)
      qb.andWhere('category.shop_id = :shopId', { shopId: query.shop_id });
    this.applyCategoryFilters(qb, query);
    const result = await this.paginateCategories(qb, query);
    return {
      success: true,
      message: 'Product categories fetched successfully.',
      data: result.data.map((item) => this.toResponse(item)),
      meta: result.meta,
    };
  }

  async findShopCategory(userId: string, shopId: string, categoryId: string) {
    await this.getApprovedSellerShop(userId, shopId);
    const category = await this.getShopCategory(shopId, categoryId);
    category.children = await this.categoryRepository.find({
      where: {
        parent: { id: category.id },
        scope: ProductCategoryScope.SHOP,
        shop: { id: shopId },
        status: Not(CategoryStatus.REMOVED),
      },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return {
      success: true,
      message: 'Product collection fetched successfully.',
      data: this.toResponse(
        category,
        await this.countCategoryProducts(category),
      ),
    };
  }

  async findAdminCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: { shop: true, seller: true, parent: true },
    });
    if (!category || category.status === CategoryStatus.REMOVED)
      throw new NotFoundException('Product category not found.');
    return {
      success: true,
      data: this.toResponse(
        category,
        await this.countCategoryProducts(category),
      ),
    };
  }

  async updateShopCategory(
    userId: string,
    shopId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    await this.getApprovedSellerShop(userId, shopId);
    const category = await this.getShopCategory(shopId, categoryId);
    if (category.disabled_by === DisabledBy.ADMIN)
      throw new ForbiddenException(
        'This collection was disabled by admin. Contact support for moderation review.',
      );
    if (dto.parent_id !== undefined) {
      category.parent = await this.getParent(
        dto.parent_id,
        ProductCategoryScope.SHOP,
        shopId,
        category.id,
      );
      if (
        !dto.parent_id &&
        (await this.getSubtreeHeight(category.id)) + 1 > MAX_CATEGORY_DEPTH
      ) {
        throw new BadRequestException(
          `Category hierarchy cannot exceed ${MAX_CATEGORY_DEPTH} levels.`,
        );
      }
    }
    if (dto.name !== undefined && dto.name.trim() !== category.name) {
      category.slug = await this.generateUniqueSlug(
        dto.name,
        ProductCategoryScope.SHOP,
        shopId,
        category.id,
      );
      category.name = dto.name.trim();
    }
    if (dto.description !== undefined)
      category.description = dto.description?.trim() || null;
    if (dto.image_url !== undefined) category.image_url = dto.image_url;
    if (dto.sort_order !== undefined) category.sort_order = dto.sort_order;
    const saved = await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Product collection updated successfully.',
      data: this.toResponse(saved, await this.countCategoryProducts(saved)),
    };
  }

  async updateShopCategoryStatus(
    userId: string,
    shopId: string,
    categoryId: string,
    dto: UpdateCategoryStatusDto,
  ) {
    await this.getApprovedSellerShop(userId, shopId);
    const category = await this.getShopCategory(shopId, categoryId);
    if (category.disabled_by === DisabledBy.ADMIN)
      throw new ForbiddenException(
        'This collection was disabled by admin and cannot be changed by the seller.',
      );
    category.status = dto.status;
    category.disabled_by =
      dto.status === CategoryStatus.DISABLED ? DisabledBy.SELLER : null;
    const saved = await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Product collection status updated successfully.',
      data: this.toResponse(saved, await this.countCategoryProducts(saved)),
    };
  }

  private async removeShopCategoryRecord(category: Category) {
    const childrenCount = await this.categoryRepository.count({
      where: {
        parent: { id: category.id },
        status: Not(CategoryStatus.REMOVED),
      },
    });
    if (childrenCount)
      throw new ConflictException(
        'Remove or reassign active child collections before removing this collection.',
      );
    await this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(ProductShopCategory)
        .delete({ categoryId: category.id });
      category.status = CategoryStatus.REMOVED;
      await manager.getRepository(Category).save(category);
    });
    return {
      success: true,
      message:
        'Product collection removed. Products remain available through their marketplace categories.',
      data: null,
    };
  }

  async removeShopCategory(userId: string, shopId: string, categoryId: string) {
    await this.getApprovedSellerShop(userId, shopId);
    const category = await this.getShopCategory(shopId, categoryId);
    if (category.disabled_by === DisabledBy.ADMIN)
      throw new ForbiddenException(
        'This collection was disabled by admin and cannot be removed by the seller.',
      );
    return this.removeShopCategoryRecord(category);
  }

  async moderateShopCategoryStatus(
    categoryId: string,
    dto: UpdateCategoryStatusDto,
  ) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        scope: ProductCategoryScope.SHOP,
      },
      relations: { shop: true },
    });

    if (!category || category.status === CategoryStatus.REMOVED) {
      throw new NotFoundException('Seller product category not found.');
    }

    if (dto.status === CategoryStatus.ACTIVE) {
      // Admin can only reactivate categories disabled by admin.
      if (category.disabled_by !== DisabledBy.ADMIN) {
        throw new BadRequestException(
          'Admin can only reactivate categories disabled by admin.',
        );
      }

      category.status = CategoryStatus.ACTIVE;
      category.disabled_by = null;
    } else if (dto.status === CategoryStatus.DISABLED) {
      // Admin can disable any seller-owned category.
      category.status = CategoryStatus.DISABLED;
      category.disabled_by = DisabledBy.ADMIN;
    } else {
      throw new BadRequestException('Invalid category status.');
    }

    const saved = await this.categoryRepository.save(category);

    return {
      success: true,
      message:
        dto.status === CategoryStatus.ACTIVE
          ? 'Seller product category reactivated by admin.'
          : 'Seller product category disabled by admin.',
      data: this.toResponse(saved, await this.countCategoryProducts(saved)),
    };
  }

  async moderateRemoveShopCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, scope: ProductCategoryScope.SHOP },
      relations: { shop: true },
    });
    if (!category || category.status === CategoryStatus.REMOVED)
      throw new NotFoundException('Seller product category not found.');
    return this.removeShopCategoryRecord(category);
  }

  async updatePlatformCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.getPlatformCategory(categoryId);
    if (dto.parent_id !== undefined) {
      category.parent = await this.getParent(
        dto.parent_id,
        ProductCategoryScope.PLATFORM,
        undefined,
        category.id,
      );
      if (
        !dto.parent_id &&
        (await this.getSubtreeHeight(category.id)) + 1 > MAX_CATEGORY_DEPTH
      ) {
        throw new BadRequestException(
          `Category hierarchy cannot exceed ${MAX_CATEGORY_DEPTH} levels.`,
        );
      }
    }
    if (dto.name !== undefined && dto.name.trim() !== category.name) {
      category.slug = await this.generateUniqueSlug(
        dto.name,
        ProductCategoryScope.PLATFORM,
        undefined,
        category.id,
      );
      category.name = dto.name.trim();
    }
    if (dto.description !== undefined)
      category.description = dto.description?.trim() || null;
    if (dto.image_url !== undefined) category.image_url = dto.image_url;
    if (dto.sort_order !== undefined) category.sort_order = dto.sort_order;
    const saved = await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Platform category updated successfully.',
      data: this.toResponse(saved, await this.countCategoryProducts(saved)),
    };
  }

  async updatePlatformCategoryStatus(
    categoryId: string,
    dto: UpdateCategoryStatusDto,
  ) {
    const category = await this.getPlatformCategory(categoryId);
    category.status = dto.status;
    category.disabled_by =
      dto.status === CategoryStatus.DISABLED ? DisabledBy.ADMIN : null;
    const saved = await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Platform category status updated successfully.',
      data: this.toResponse(saved, await this.countCategoryProducts(saved)),
    };
  }

  async removePlatformCategory(categoryId: string) {
    const category = await this.getPlatformCategory(categoryId);
    const [childrenCount, productsCount] = await Promise.all([
      this.categoryRepository.count({
        where: {
          parent: { id: category.id },
          status: Not(CategoryStatus.REMOVED),
        },
      }),
      this.productRepository.count({
        where: {
          primaryCategory: { id: category.id },
          status: Not(ProductStatus.REMOVED),
        },
      }),
    ]);
    if (childrenCount)
      throw new ConflictException(
        'Remove or reassign active child categories before removing this category.',
      );
    if (productsCount)
      throw new ConflictException(
        'Reassign products to another platform category before removing this category.',
      );
    category.status = CategoryStatus.REMOVED;
    await this.categoryRepository.save(category);
    return {
      success: true,
      message: 'Platform category removed successfully.',
      data: null,
    };
  }

  private flattenTree(nodes: any[]): any[] {
    const result: any[] = [];
    for (const node of nodes) {
      const { children, ...category } = node;
      result.push(category);
      result.push(...this.flattenTree(children ?? []));
    }
    return result;
  }

  async findPublicPlatformCategories() {
    const categories = await this.categoryRepository.find({
      where: {
        scope: ProductCategoryScope.PLATFORM,
        status: CategoryStatus.ACTIVE,
        shop: IsNull(),
      },
      relations: { parent: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return {
      success: true,
      data: this.flattenTree(this.buildTree(categories)),
    };
  }

  private buildTree(categories: Category[]) {
    const map = new Map<string, any>();
    categories.forEach((category) =>
      map.set(category.id, { ...this.toResponse(category), children: [] }),
    );
    const roots: any[] = [];
    for (const category of categories) {
      const node = map.get(category.id);
      if (category.parent && map.has(category.parent.id))
        map.get(category.parent.id).children.push(node);
      else if (!category.parent) roots.push(node);
    }
    return roots;
  }

  async getPublicPlatformTree() {
    const categories = await this.categoryRepository.find({
      where: {
        scope: ProductCategoryScope.PLATFORM,
        status: CategoryStatus.ACTIVE,
        shop: IsNull(),
      },
      relations: { parent: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return { success: true, data: this.buildTree(categories) };
  }

  async findPublicPlatformCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
        scope: ProductCategoryScope.PLATFORM,
        status: CategoryStatus.ACTIVE,
        shop: IsNull(),
      },
      relations: { parent: true },
    });
    if (!category) throw new NotFoundException('Product category not found.');
    let parent = category.parent;
    while (parent) {
      if (
        parent.status !== CategoryStatus.ACTIVE ||
        parent.scope !== ProductCategoryScope.PLATFORM
      )
        throw new NotFoundException('Product category not found.');
      parent = parent.parent
        ? await this.categoryRepository.findOne({
            where: { id: parent.parent.id },
            relations: { parent: true },
          })
        : null;
    }
    return {
      success: true,
      data: this.toResponse(
        category,
        await this.countCategoryProducts(category),
      ),
    };
  }

  async getPublicShopCategoryTree(shopId: string) {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId, status: ShopStatus.ACTIVE },
      relations: { seller: true },
    });
    if (
      !shop ||
      shop.seller.status !== SellerStatus.APPROVED ||
      shop.seller.approved !== true
    )
      throw new NotFoundException('Shop not found.');
    const categories = await this.categoryRepository.find({
      where: {
        scope: ProductCategoryScope.SHOP,
        shop: { id: shopId },
        status: CategoryStatus.ACTIVE,
      },
      relations: { parent: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return { success: true, data: this.buildTree(categories) };
  }

  async getShopCategoryTree(userId: string, shopId: string) {
    await this.getApprovedSellerShop(userId, shopId);
    const categories = await this.categoryRepository.find({
      where: {
        scope: ProductCategoryScope.SHOP,
        shop: { id: shopId },
        status: Not(CategoryStatus.REMOVED),
      },
      relations: { parent: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return { success: true, data: this.buildTree(categories) };
  }
}
