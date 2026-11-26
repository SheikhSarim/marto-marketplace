import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import {
  Product,
  ProductImage,
  ApiResponse,
  ProductStatus,
  DiscountType,
  ProductAvailability,
  CreateProductDto,
  UpdateProductDto,
} from '@/types';

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  primary_category_id?: string;
  shop_category_id?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  availability?: ProductAvailability;
  status?: ProductStatus;
  sortBy?:
    | 'product.created_at'
    | 'product.final_price'
    | 'product.name'
    | 'product.stock_quantity'
    | 'product.sold_count'
    | 'product.rating_avg'
    | 'product.updated_at';
  page?: number;
  limit?: number;
}

export function calculateFinalPrice(
  price: number,
  discountType: DiscountType = 'NONE',
  discountValue: number = 0
): number {
  const safePrice = Math.max(0, Number(price) || 0);
  const safeVal = Math.max(0, Number(discountValue) || 0);
  if (discountType === 'PERCENTAGE') {
    const pct = Math.min(100, safeVal);
    return Math.max(0, Math.round(safePrice - (safePrice * pct) / 100));
  }
  if (discountType === 'FIXED') {
    return Math.max(0, Math.round(safePrice - safeVal));
  }
  return Math.round(safePrice);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeProductImages(rawImages: unknown): {
  urls: string[];
  productImages: ProductImage[];
} {
  if (!Array.isArray(rawImages) || rawImages.length === 0) {
    return { urls: [], productImages: [] };
  }

  if (typeof rawImages[0] === 'string') {
    const strUrls = rawImages.filter((u): u is string => typeof u === 'string' && u.trim() !== '');
    const productImages: ProductImage[] = strUrls.map((u, idx) => ({
      id: `img_${idx}`,
      url: u,
      image_url: u,
      is_primary: idx === 0,
      sort_order: idx,
    }));
    return { urls: strUrls, productImages };
  }

  const normalized: ProductImage[] = rawImages
    .map((item, idx) => {
      const img = asRecord(item);
      const url =
        (typeof img.image_url === 'string' && img.image_url) ||
        (typeof img.url === 'string' && img.url) ||
        (typeof img.secure_url === 'string' && img.secure_url) ||
        '';
      return {
        id: String(img.id || `img_${idx}`),
        url,
        image_url: url,
        is_primary: Boolean(img.is_primary),
        sort_order: typeof img.sort_order === 'number' ? img.sort_order : idx,
      };
    })
    .filter((i) => Boolean(i.url));

  const sorted = [...normalized].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  return {
    urls: sorted.map((i) => i.url),
    productImages: normalized,
  };
}

export function normalizeBackendProduct(raw: unknown): Product {
  const outer = asRecord(raw);
  const outerData = asRecord(outer.data);
  const p = asRecord(outerData.product || outer.product || outer.data || outer);
  const shopObj = asRecord(p.shop);
  const primaryCatObj = asRecord(p.primary_category);

  const price = Number(p.price ?? 0);
  const discountType: DiscountType =
    p.discount_type === 'PERCENTAGE' || p.discount_type === 'FIXED' || p.discount_type === 'NONE'
      ? p.discount_type
      : Number(p.discount ?? 0) > 0
      ? 'PERCENTAGE'
      : 'NONE';
  const discountValue = Number(p.discount_value ?? p.discount ?? 0);
  const finalPrice =
    p.final_price !== undefined
      ? Number(p.final_price)
      : p.finalPrice !== undefined
      ? Number(p.finalPrice)
      : calculateFinalPrice(price, discountType, discountValue);

  const primaryCatId = String(
    p.primary_category_id || primaryCatObj.id || p.categoryId || ''
  );

  const shopCatIds: string[] = Array.isArray(p.shop_category_ids)
    ? p.shop_category_ids.map(String)
    : Array.isArray(p.shop_categories)
    ? p.shop_categories.map((c) => String(asRecord(c).id || ''))
    : [];

  const { urls, productImages } = normalizeProductImages(p.images || p.product_images);

  const discountPct =
    discountType === 'PERCENTAGE'
      ? discountValue
      : price > 0 && finalPrice < price
      ? Math.round(((price - finalPrice) / price) * 100)
      : 0;

  const name = typeof p.name === 'string' ? p.name : '';

  return {
    id: String(p.id || ''),
    sellerId: String(p.seller_id || p.sellerId || shopObj.seller_id || ''),
    shopId: String(p.shop_id || p.shopId || shopObj.id || ''),
    shopName: typeof shopObj.name === 'string' ? shopObj.name : undefined,
    shopCity: typeof shopObj.city === 'string' ? shopObj.city : undefined,
    categoryId: primaryCatId,
    primary_category_id: primaryCatId,
    primaryCategoryName:
      typeof primaryCatObj.name === 'string' ? primaryCatObj.name : undefined,
    shop_category_ids: shopCatIds,
    shop_categories: Array.isArray(p.shop_categories)
      ? p.shop_categories.map((c) => {
          const rec = asRecord(c);
          return {
            id: String(rec.id || ''),
            name: String(rec.name || ''),
            slug: typeof rec.slug === 'string' ? rec.slug : undefined,
          };
        })
      : undefined,
    name,
    slug:
      typeof p.slug === 'string' && p.slug
        ? p.slug
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: typeof p.description === 'string' ? p.description : '',
    price,
    discount: discountPct,
    discount_type: discountType,
    discount_value: discountValue,
    sale_starts_at: typeof p.sale_starts_at === 'string' ? p.sale_starts_at : null,
    sale_ends_at: typeof p.sale_ends_at === 'string' ? p.sale_ends_at : null,
    finalPrice,
    images: urls,
    productImages,
    stock: Number(p.stock_quantity ?? p.stock ?? 0),
    low_stock_threshold:
      p.low_stock_threshold !== undefined ? Number(p.low_stock_threshold) : 5,
    brand: typeof p.brand === 'string' ? p.brand : '',
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    weightKg: p.weight !== undefined ? Number(p.weight) : undefined,
    prepaidFlag: Boolean(p.is_prepaid_only ?? p.prepaidFlag),
    is_prepaid_only: Boolean(p.is_prepaid_only ?? p.prepaidFlag),
    sold_count: Number(p.sold_count ?? 0),
    status: (typeof p.status === 'string' ? p.status : 'ACTIVE') as ProductStatus,
    rating: typeof p.rating_avg === 'number' ? p.rating_avg : typeof p.rating === 'number' ? p.rating : undefined,
    reviewsCount:
      typeof p.reviews_count === 'number'
        ? p.reviews_count
        : typeof p.reviewsCount === 'number'
        ? p.reviewsCount
        : 0,
    createdAt:
      typeof p.created_at === 'string'
        ? p.created_at
        : typeof p.createdAt === 'string'
        ? p.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof p.updated_at === 'string'
        ? p.updated_at
        : typeof p.updatedAt === 'string'
        ? p.updatedAt
        : new Date().toISOString(),
  };
}

function extractItems(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  const r = asRecord(response);
  if (Array.isArray(r.data)) return r.data;
  const nested = asRecord(r.data);
  if (Array.isArray(nested.items)) return nested.items;
  return [];
}

export const productService = {
  async getPublicProducts(filters: ProductFilterParams = {}): Promise<ApiResponse<Product[]>> {
    const qp = new URLSearchParams();
    if (filters.status) qp.set('status', filters.status);
    const primaryCatId = filters.primary_category_id || filters.categoryId;
    if (primaryCatId) qp.set('primary_category_id', primaryCatId);
    if (filters.shop_category_id) qp.set('shop_category_id', filters.shop_category_id);
    if (filters.availability) {
      qp.set('availability', filters.availability);
    } else if (filters.inStockOnly) {
      qp.set('availability', 'IN_STOCK');
    }
    if (filters.minPrice !== undefined) qp.set('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) qp.set('max_price', String(filters.maxPrice));
    if (filters.search?.trim()) qp.set('search', filters.search.trim());
    if (filters.shopId) qp.set('shop_id', filters.shopId);
    if (filters.page) qp.set('page', String(filters.page));
    if (filters.limit) qp.set('limit', String(filters.limit));
    if (filters.sortBy) qp.set('sortBy', filters.sortBy);

    const qs = qp.toString();
    const response = await apiClient.get<ApiResponse<unknown[]>>(
      `${ENDPOINTS.PUBLIC_PRODUCTS.path}${qs ? `?${qs}` : ''}`,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product[]>),
      data: extractItems(response).map(normalizeBackendProduct),
    };
  },

  async getPublicProductById(productId: string): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/products/${encodeURIComponent(productId)}`,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product>),
      data: normalizeBackendProduct(response),
    };
  },

  async getSellerShopProducts(
    shopId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ProductStatus;
      primary_category_id?: string;
      shop_category_id?: string;
      availability?: ProductAvailability;
      min_price?: number;
      max_price?: number;
      sortBy?: ProductFilterParams['sortBy'];
    }
  ): Promise<ApiResponse<Product[]>> {
    const qp = new URLSearchParams();
    qp.set('page', String(params?.page || 1));
    qp.set('limit', String(Math.min(100, params?.limit || 20)));
    if (params?.search?.trim()) qp.set('search', params.search.trim());
    if (params?.status) qp.set('status', params.status);
    if (params?.primary_category_id) qp.set('primary_category_id', params.primary_category_id);
    if (params?.shop_category_id) qp.set('shop_category_id', params.shop_category_id);
    if (params?.availability) qp.set('availability', params.availability);
    if (params?.min_price !== undefined) qp.set('min_price', String(params.min_price));
    if (params?.max_price !== undefined) qp.set('max_price', String(params.max_price));
    if (params?.sortBy) qp.set('sortBy', params.sortBy);

    const response = await apiClient.get<ApiResponse<unknown[]>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products?${qp.toString()}`
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product[]>),
      data: extractItems(response).map(normalizeBackendProduct),
    };
  },

  async getSellerShopProductById(
    shopId: string,
    productId: string
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(productId)}`
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product>),
      data: normalizeBackendProduct(response),
    };
  },

  async createSellerShopProduct(
    shopId: string,
    dto: CreateProductDto
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products`,
      dto
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product>),
      data: normalizeBackendProduct(response),
    };
  },

  async updateSellerShopProduct(
    shopId: string,
    productId: string,
    dto: UpdateProductDto
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(productId)}`,
      dto
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product>),
      data: normalizeBackendProduct(response),
    };
  },

  async updateSellerShopProductStatus(
    shopId: string,
    productId: string,
    status: 'ACTIVE' | 'DISABLED'
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(productId)}/status`,
      { status }
    );
    return {
      ...(asRecord(response) as unknown as ApiResponse<Product>),
      data: normalizeBackendProduct(response),
    };
  },

  async deleteSellerShopProduct(shopId: string, productId: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(productId)}`
    );
  },

  async uploadSellerProductImages(
    shopId: string,
    productId: string,
    formData: FormData
  ): Promise<ApiResponse<Product>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(productId)}/images`,
      formData
    );
    const refreshed = await this.getSellerShopProductById(shopId, productId);
    return {
      ...refreshed,
      message: (asRecord(response).message as string) || 'Product images uploaded successfully.',
    };
  },

  async setPrimaryProductImage(
    shopId: string,
    productId: string,
    imageId: string
  ): Promise<ApiResponse<Product>> {
    await apiClient.patch(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(
        productId
      )}/images/${encodeURIComponent(imageId)}/primary`
    );
    return this.getSellerShopProductById(shopId, productId);
  },

  async deleteProductImage(
    shopId: string,
    productId: string,
    imageId: string
  ): Promise<ApiResponse<Product>> {
    await apiClient.delete(
      `/seller/shops/${encodeURIComponent(shopId)}/products/${encodeURIComponent(
        productId
      )}/images/${encodeURIComponent(imageId)}`
    );
    return this.getSellerShopProductById(shopId, productId);
  },

  async getAdminProducts(): Promise<ApiResponse<Product[]>> {
    throw new ApiNotAvailableError(
      'ADMIN_PRODUCTS',
      ENDPOINTS.ADMIN_PRODUCTS.method,
      ENDPOINTS.ADMIN_PRODUCTS.path,
      'Super Admin global product moderation endpoint is not yet exposed by the backend.'
    );
  },
};
