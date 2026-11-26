import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import {
  Category,
  ApiResponse,
  CategoryStatus,
  MarketplaceShopCategory,
  CreateShopCategoryDto,
  SellerCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeCategory(raw: unknown): Category {
  const r = asRecord(raw);
  const parentRaw = r.parent ? asRecord(r.parent) : null;
  const imageUrl =
    (typeof r.image_url === 'string' && r.image_url) ||
    (typeof r.image === 'string' && r.image) ||
    undefined;
  const name = typeof r.name === 'string' ? r.name : '';

  return {
    id: String(r.id || ''),
    sellerId: typeof r.seller_id === 'string' ? r.seller_id : typeof r.sellerId === 'string' ? r.sellerId : null,
    shop_id: typeof r.shop_id === 'string' ? r.shop_id : typeof r.shopId === 'string' ? r.shopId : null,
    name,
    slug:
      typeof r.slug === 'string' && r.slug
        ? r.slug
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: typeof r.description === 'string' ? r.description : '',
    iconName: typeof r.iconName === 'string' ? r.iconName : undefined,
    image: imageUrl,
    image_url: imageUrl,
    parent_id:
      typeof r.parent_id === 'string'
        ? r.parent_id
        : typeof parentRaw?.id === 'string'
        ? parentRaw.id
        : null,
    parent: parentRaw
      ? {
          id: String(parentRaw.id || ''),
          name: String(parentRaw.name || ''),
          slug: typeof parentRaw.slug === 'string' ? parentRaw.slug : undefined,
        }
      : null,
    children: Array.isArray(r.children) ? r.children.map(normalizeCategory) : undefined,
    sort_order: typeof r.sort_order === 'number' ? r.sort_order : 0,
    scope:
      r.scope === 'SELLER' || r.scope === 'PLATFORM'
        ? r.scope
        : r.shop_id || r.seller_id
        ? 'SELLER'
        : 'PLATFORM',
    status: (typeof r.status === 'string' ? r.status : 'ACTIVE') as CategoryStatus,
    productCount:
      typeof r.products_count === 'number'
        ? r.products_count
        : typeof r.productCount === 'number'
        ? r.productCount
        : 0,
    products_count:
      typeof r.products_count === 'number'
        ? r.products_count
        : typeof r.productCount === 'number'
        ? r.productCount
        : 0,
    created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
}

function normalizeSellerCategory(raw: unknown): SellerCategory {
  const r = asRecord(raw);
  const parentRaw = r.parent ? asRecord(r.parent) : null;
  const shopRaw = r.shop ? asRecord(r.shop) : null;
  const imageUrl =
    (typeof r.image_url === 'string' && r.image_url) ||
    (typeof r.image === 'string' && r.image) ||
    undefined;
  const name = typeof r.name === 'string' ? r.name : '';

  return {
    id: String(r.id || ''),
    seller_id: typeof r.seller_id === 'string' ? r.seller_id : undefined,
    sellerId: typeof r.sellerId === 'string' ? r.sellerId : typeof r.seller_id === 'string' ? r.seller_id : undefined,
    shop_id: typeof r.shop_id === 'string' ? r.shop_id : typeof shopRaw?.id === 'string' ? shopRaw.id : undefined,
    shop: shopRaw
      ? {
          id: String(shopRaw.id || ''),
          name: String(shopRaw.name || ''),
          status: typeof shopRaw.status === 'string' ? shopRaw.status : undefined,
        }
      : null,
    name,
    slug:
      typeof r.slug === 'string' && r.slug
        ? r.slug
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: typeof r.description === 'string' ? r.description : '',
    parent_id:
      typeof r.parent_id === 'string'
        ? r.parent_id
        : typeof parentRaw?.id === 'string'
        ? parentRaw.id
        : null,
    parent: parentRaw
      ? {
          id: String(parentRaw.id || ''),
          name: String(parentRaw.name || ''),
          slug: typeof parentRaw.slug === 'string' ? parentRaw.slug : undefined,
        }
      : null,
    children: Array.isArray(r.children) ? r.children.map(normalizeSellerCategory) : undefined,
    sort_order: typeof r.sort_order === 'number' ? r.sort_order : 0,
    scope: r.scope === 'PLATFORM' ? 'PLATFORM' : 'SELLER',
    status: (typeof r.status === 'string' ? r.status : 'ACTIVE') as CategoryStatus,
    disabled_by_admin: Boolean(r.disabled_by_admin),
    products_count:
      typeof r.products_count === 'number'
        ? r.products_count
        : typeof r.productCount === 'number'
        ? r.productCount
        : 0,
    productCount:
      typeof r.products_count === 'number'
        ? r.products_count
        : typeof r.productCount === 'number'
        ? r.productCount
        : 0,
    image: imageUrl,
    image_url: imageUrl,
    created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : undefined,
  };
}

function extractList(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const r = asRecord(response);
  if (Array.isArray(r.data)) return r.data;
  const nested = asRecord(r.data);
  if (Array.isArray(nested.items)) return nested.items;
  return [];
}

export const categoryService = {
  // Public
  async getPublicCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      ENDPOINTS.PUBLIC_PRODUCT_CATEGORIES.path,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category[]>),
      data: extractList(response).map(normalizeCategory),
    };
  },

  async getPublicCategoryTree(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      ENDPOINTS.PUBLIC_PRODUCT_CATEGORIES_TREE.path,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category[]>),
      data: extractList(response).map(normalizeCategory),
    };
  },

  async getPublicCategoryById(id: string): Promise<ApiResponse<Category>> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/product-categories/${encodeURIComponent(id)}`,
      { skipAuth: true, skipRefreshRetry: true }
    );
    const raw = asRecord(response).data ?? response;
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category>),
      data: normalizeCategory(raw),
    };
  },

  async getPublicShopCollections(shopId: string): Promise<ApiResponse<SellerCategory[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      `/shops/${encodeURIComponent(shopId)}/product-categories`,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory[]>),
      data: extractList(response).map(normalizeSellerCategory),
    };
  },

  // Shop Categories (Registration & Admin)
  async getActiveShopCategories(): Promise<ApiResponse<MarketplaceShopCategory[]>> {
    const response = await apiClient.get<ApiResponse<MarketplaceShopCategory[]>>(
      ENDPOINTS.SHOP_CATEGORIES_ACTIVE.path,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<MarketplaceShopCategory[]>),
      data: extractList(response) as MarketplaceShopCategory[],
    };
  },

  async createAdminShopCategory(
    dto: CreateShopCategoryDto
  ): Promise<ApiResponse<MarketplaceShopCategory>> {
    if (!ENDPOINTS.ADMIN_CREATE_SHOP_CATEGORY.available) {
      throw new ApiNotAvailableError(
        'ADMIN_CREATE_SHOP_CATEGORY',
        'POST',
        ENDPOINTS.ADMIN_CREATE_SHOP_CATEGORY.path
      );
    }
    return apiClient.post<ApiResponse<MarketplaceShopCategory>>(
      ENDPOINTS.ADMIN_CREATE_SHOP_CATEGORY.path,
      {
        name: dto.name.trim(),
        ...(dto.description?.trim() ? { description: dto.description.trim() } : {}),
      }
    );
  },

  // Admin Product Categories & Moderation
  async getAdminProductCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      ENDPOINTS.ADMIN_PRODUCT_CATEGORIES.path
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category[]>),
      data: extractList(response).map(normalizeCategory),
    };
  },

  async createCategory(dto: CreateCategoryDto): Promise<ApiResponse<Category>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      ENDPOINTS.ADMIN_PRODUCT_CATEGORY_CREATE.path,
      {
        name: dto.name.trim(),
        ...(dto.description?.trim() ? { description: dto.description.trim() } : {}),
        ...(dto.parent_id ? { parent_id: dto.parent_id } : {}),
        sort_order: dto.sort_order ?? 0,
        ...(dto.image_url?.trim() ? { image_url: dto.image_url.trim() } : {}),
      }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category>),
      data: normalizeCategory(asRecord(response).data ?? response),
    };
  },

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/product-categories/${encodeURIComponent(id)}`,
      {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.parent_id !== undefined ? { parent_id: dto.parent_id || undefined } : {}),
        ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
        ...(dto.image_url !== undefined
          ? { image_url: dto.image_url.trim() || undefined }
          : {}),
      }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category>),
      data: normalizeCategory(asRecord(response).data ?? response),
    };
  },

  async updateCategoryStatus(
    id: string,
    status: 'ACTIVE' | 'DISABLED'
  ): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/product-categories/${encodeURIComponent(id)}/status`,
      { status }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Category>),
      data: normalizeCategory(asRecord(response).data ?? response),
    };
  },

  async removeAdminProductCategory(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/admin/product-categories/${encodeURIComponent(id)}`
    );
  },

  async getAdminSellerCollections(): Promise<ApiResponse<SellerCategory[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      ENDPOINTS.ADMIN_SELLER_COLLECTIONS.path
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory[]>),
      data: extractList(response).map(normalizeSellerCategory),
    };
  },

  async updateAdminSellerCollectionStatus(
    id: string,
    status: 'ACTIVE' | 'DISABLED'
  ): Promise<ApiResponse<SellerCategory>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/admin/product-categories/seller-categories/${encodeURIComponent(id)}/status`,
      { status }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory>),
      data: normalizeSellerCategory(asRecord(response).data ?? response),
    };
  },

  async removeAdminSellerCollection(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/admin/product-categories/seller-categories/${encodeURIComponent(id)}`
    );
  },

  // Seller Shop Collections
  async getSellerShopCollections(
    shopId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: CategoryStatus;
      parent_id?: string;
      root?: boolean;
      created_from?: string;
      created_to?: string;
      sortBy?: 'sort_order' | 'name' | 'created_at' | 'updated_at';
      sortOrder?: 'ASC' | 'DESC';
    }
  ): Promise<ApiResponse<SellerCategory[]>> {
    const qp = new URLSearchParams();
    qp.set('page', String(params?.page || 1));
    qp.set('limit', String(Math.min(100, params?.limit || 10)));
    if (params?.search?.trim()) qp.set('search', params.search.trim());
    if (params?.status) qp.set('status', params.status);
    if (params?.parent_id) qp.set('parent_id', params.parent_id);
    if (params?.root !== undefined) qp.set('root', String(params.root));
    if (params?.created_from) qp.set('created_from', params.created_from);
    if (params?.created_to) qp.set('created_to', params.created_to);
    if (params?.sortBy) qp.set('sortBy', params.sortBy);
    if (params?.sortOrder) qp.set('sortOrder', params.sortOrder);

    const response = await apiClient.get<ApiResponse<unknown[]>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories?${qp.toString()}`
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory[]>),
      data: extractList(response).map(normalizeSellerCategory),
    };
  },

  async getSellerShopCollectionTree(shopId: string): Promise<ApiResponse<SellerCategory[]>> {
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories/tree`
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory[]>),
      data: extractList(response).map(normalizeSellerCategory),
    };
  },

  async getSellerShopCollectionById(
    shopId: string,
    id: string
  ): Promise<ApiResponse<SellerCategory>> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories/${encodeURIComponent(id)}`
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory>),
      data: normalizeSellerCategory(asRecord(response).data ?? response),
    };
  },

  async createSellerShopCollection(
    shopId: string,
    dto: CreateCategoryDto
  ): Promise<ApiResponse<SellerCategory>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories`,
      {
        name: dto.name.trim(),
        ...(dto.description?.trim() ? { description: dto.description.trim() } : {}),
        ...(dto.parent_id ? { parent_id: dto.parent_id } : {}),
        sort_order: dto.sort_order ?? 0,
        ...(dto.image_url?.trim() ? { image_url: dto.image_url.trim() } : {}),
      }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory>),
      data: normalizeSellerCategory(asRecord(response).data ?? response),
    };
  },

  async updateSellerShopCollection(
    shopId: string,
    id: string,
    dto: UpdateCategoryDto
  ): Promise<ApiResponse<SellerCategory>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories/${encodeURIComponent(id)}`,
      {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.parent_id !== undefined ? { parent_id: dto.parent_id || undefined } : {}),
        ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
        ...(dto.image_url !== undefined
          ? { image_url: dto.image_url.trim() || undefined }
          : {}),
      }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory>),
      data: normalizeSellerCategory(asRecord(response).data ?? response),
    };
  },

  async updateSellerShopCollectionStatus(
    shopId: string,
    id: string,
    status: 'ACTIVE' | 'DISABLED'
  ): Promise<ApiResponse<SellerCategory>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories/${encodeURIComponent(id)}/status`,
      { status }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<SellerCategory>),
      data: normalizeSellerCategory(asRecord(response).data ?? response),
    };
  },

  async removeSellerShopCollection(shopId: string, id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/seller/shops/${encodeURIComponent(shopId)}/product-categories/${encodeURIComponent(id)}`
    );
  },
};
