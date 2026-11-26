import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import { Shop, ApiResponse, ShopStatus, UpdateShopDto, ShopOpeningHours } from '@/types';

function unwrapRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | undefined;
  const shop = (data?.shop || r.shop || data || r) as Record<string, unknown>;
  return shop && typeof shop === 'object' ? shop : {};
}

export function normalizeBackendShop(raw: unknown): Shop {
  const s = unwrapRecord(raw);
  const shopCat = (s.shop_category as Record<string, unknown> | undefined) ?? undefined;
  const sellerObj = (s.seller as Record<string, unknown> | undefined) ?? undefined;

  const openingHoursObj =
    s.opening_hours && typeof s.opening_hours === 'object'
      ? (s.opening_hours as ShopOpeningHours)
      : null;

  const name = typeof s.name === 'string' ? s.name : '';

  return {
    id: String(s.id || ''),
    sellerId: String(s.seller_id || s.sellerId || sellerObj?.id || ''),
    name,
    slug:
      typeof s.slug === 'string' && s.slug
        ? s.slug
        : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: typeof s.description === 'string' ? s.description : '',
    logo:
      (typeof s.logo === 'string' && s.logo) ||
      (typeof s.logo_url === 'string' && s.logo_url) ||
      undefined,
    coverImage:
      (typeof s.cover_image === 'string' && s.cover_image) ||
      (typeof s.coverImage === 'string' && s.coverImage) ||
      undefined,
    cover_image:
      (typeof s.cover_image === 'string' && s.cover_image) ||
      (typeof s.coverImage === 'string' && s.coverImage) ||
      undefined,
    category:
      (typeof s.custom_category_name === 'string' && s.custom_category_name) ||
      (typeof shopCat?.name === 'string' && shopCat.name) ||
      (typeof s.category_name === 'string' && s.category_name) ||
      (typeof s.category === 'string' && s.category) ||
      'Uncategorized',
    category_name:
      (typeof shopCat?.name === 'string' && shopCat.name) ||
      (typeof s.category_name === 'string' && s.category_name) ||
      (typeof s.category === 'string' && s.category) ||
      undefined,
    shop_category_id:
      (typeof s.shop_category_id === 'string' && s.shop_category_id) ||
      (typeof shopCat?.id === 'string' && shopCat.id) ||
      undefined,
    custom_category_name:
      typeof s.custom_category_name === 'string' ? s.custom_category_name : undefined,
    address: typeof s.address === 'string' ? s.address : '',
    city: typeof s.city === 'string' ? s.city : '',
    contactEmail:
      (typeof s.contact_email === 'string' && s.contact_email) ||
      (typeof s.contactEmail === 'string' && s.contactEmail) ||
      '',
    contact_email:
      (typeof s.contact_email === 'string' && s.contact_email) ||
      (typeof s.contactEmail === 'string' && s.contactEmail) ||
      '',
    contactPhone:
      (typeof s.contact_phone === 'string' && s.contact_phone) ||
      (typeof s.contactPhone === 'string' && s.contactPhone) ||
      '',
    contact_phone:
      (typeof s.contact_phone === 'string' && s.contact_phone) ||
      (typeof s.contactPhone === 'string' && s.contactPhone) ||
      '',
    openingHours:
      typeof s.opening_hours === 'string'
        ? s.opening_hours
        : typeof s.openingHours === 'string'
        ? s.openingHours
        : undefined,
    opening_hours: openingHoursObj,
    deliveryInfo:
      (typeof s.delivery_information === 'string' && s.delivery_information) ||
      (typeof s.deliveryInfo === 'string' && s.deliveryInfo) ||
      '',
    delivery_information:
      (typeof s.delivery_information === 'string' && s.delivery_information) ||
      (typeof s.deliveryInfo === 'string' && s.deliveryInfo) ||
      '',
    deliveryFee:
      typeof s.delivery_fee === 'number'
        ? s.delivery_fee
        : typeof s.deliveryFee === 'number'
        ? s.deliveryFee
        : null,
    estimatedDeliveryTime:
      typeof s.estimated_delivery_time === 'string'
        ? s.estimated_delivery_time
        : typeof s.estimatedDeliveryTime === 'string'
        ? s.estimatedDeliveryTime
        : undefined,
    rating: typeof s.rating === 'number' ? s.rating : undefined,
    totalReviews: typeof s.total_reviews === 'number' ? s.total_reviews : undefined,
    status: ((typeof s.status === 'string' ? s.status : 'ACTIVE') as ShopStatus),
    createdAt:
      (typeof s.created_at === 'string' && s.created_at) ||
      (typeof s.createdAt === 'string' && s.createdAt) ||
      new Date().toISOString(),
    updatedAt:
      (typeof s.updated_at === 'string' && s.updated_at) ||
      (typeof s.updatedAt === 'string' && s.updatedAt) ||
      new Date().toISOString(),
  };
}

export const shopService = {
  async getPublicShops(): Promise<ApiResponse<Shop[]>> {
    if (!ENDPOINTS.PUBLIC_SHOPS.available) {
      throw new ApiNotAvailableError(
        'PUBLIC_SHOPS',
        ENDPOINTS.PUBLIC_SHOPS.method,
        ENDPOINTS.PUBLIC_SHOPS.path,
        'Public shop directory listing is not yet exposed by the backend API.'
      );
    }
    const res = await apiClient.get<ApiResponse<unknown[]>>(ENDPOINTS.PUBLIC_SHOPS.path, {
      skipAuth: true,
      skipRefreshRetry: true,
    });
    const list = Array.isArray(res?.data) ? res.data : [];
    return {
      ...res,
      data: list.map(normalizeBackendShop),
    };
  },

  async getPublicShopById(shopId: string): Promise<ApiResponse<Shop>> {
    if (!ENDPOINTS.PUBLIC_SHOP_DETAIL.available) {
      throw new ApiNotAvailableError(
        'PUBLIC_SHOP_DETAIL',
        ENDPOINTS.PUBLIC_SHOP_DETAIL.method,
        ENDPOINTS.PUBLIC_SHOP_DETAIL.path,
        'Public shop storefront detail API is not yet exposed by the backend.'
      );
    }
    const res = await apiClient.get<ApiResponse<unknown>>(
      `/shops/${encodeURIComponent(shopId)}`,
      { skipAuth: true, skipRefreshRetry: true }
    );
    return {
      ...res,
      data: normalizeBackendShop(res.data),
    };
  },

  async getMyShop(): Promise<ApiResponse<Shop>> {
    if (!ENDPOINTS.SELLER_MY_SHOP.available) {
      throw new ApiNotAvailableError('SELLER_MY_SHOP', 'GET', ENDPOINTS.SELLER_MY_SHOP.path);
    }
    const response = await apiClient.get<ApiResponse<unknown>>(ENDPOINTS.SELLER_MY_SHOP.path);
    return {
      ...response,
      data: normalizeBackendShop(response),
    };
  },

  async updateMyShop(dto: UpdateShopDto): Promise<ApiResponse<Shop>> {
    if (!ENDPOINTS.SELLER_UPDATE_SHOP.available) {
      throw new ApiNotAvailableError('SELLER_UPDATE_SHOP', 'PATCH', ENDPOINTS.SELLER_UPDATE_SHOP.path);
    }
    const response = await apiClient.patch<ApiResponse<unknown>>(
      ENDPOINTS.SELLER_UPDATE_SHOP.path,
      dto
    );
    return {
      ...response,
      data: normalizeBackendShop(response),
    };
  },

  async updateMyShopImages(formData: FormData): Promise<ApiResponse<Shop>> {
    if (!ENDPOINTS.SELLER_UPDATE_SHOP_IMAGES.available) {
      throw new ApiNotAvailableError(
        'SELLER_UPDATE_SHOP_IMAGES',
        'PATCH',
        ENDPOINTS.SELLER_UPDATE_SHOP_IMAGES.path
      );
    }
    const response = await apiClient.patch<ApiResponse<unknown>>(
      ENDPOINTS.SELLER_UPDATE_SHOP_IMAGES.path,
      formData
    );
    return {
      ...response,
      data: normalizeBackendShop(response),
    };
  },

  async updateMyShopStatus(status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<Shop>> {
    if (!ENDPOINTS.SELLER_UPDATE_SHOP_STATUS.available) {
      throw new ApiNotAvailableError(
        'SELLER_UPDATE_SHOP_STATUS',
        'PATCH',
        ENDPOINTS.SELLER_UPDATE_SHOP_STATUS.path
      );
    }
    const response = await apiClient.patch<ApiResponse<unknown>>(
      ENDPOINTS.SELLER_UPDATE_SHOP_STATUS.path,
      { status }
    );
    return {
      ...response,
      data: normalizeBackendShop(response),
    };
  },
};
