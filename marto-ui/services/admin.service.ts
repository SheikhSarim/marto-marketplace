import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import {
  PlatformSettings,
  AuditLog,
  ApiResponse,
  ShopStatus,
  AdminShopRecord,
  Seller,
} from '@/types';

export interface AdminDashboardMetrics {
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  disabledSellers: number;
  totalShops: number;
  activeShops: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  platformRevenue: number;
  gmv: number;
  platformFeeRate: number;
}

export const adminService = {
  async getDashboardMetrics(): Promise<ApiResponse<AdminDashboardMetrics>> {
    throw new ApiNotAvailableError(
      'ADMIN_METRICS',
      ENDPOINTS.ADMIN_METRICS.method,
      ENDPOINTS.ADMIN_METRICS.path,
      'Platform-wide order, GMV, and revenue analytics endpoint is not yet exposed in the backend API.'
    );
  },

  async getPlatformSettings(): Promise<ApiResponse<PlatformSettings>> {
    throw new ApiNotAvailableError(
      'PLATFORM_SETTINGS',
      ENDPOINTS.PLATFORM_SETTINGS.method,
      ENDPOINTS.PLATFORM_SETTINGS.path,
      'Platform configuration and statutory fee rules endpoint is not yet published.'
    );
  },

  async getAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    throw new ApiNotAvailableError(
      'AUDIT_LOGS',
      ENDPOINTS.AUDIT_LOGS.method,
      ENDPOINTS.AUDIT_LOGS.path,
      'Security audit log stream endpoint is not yet published.'
    );
  },

  async getSellersPaginated(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'PENDING' | 'APPROVED' | 'DISABLED' | 'REJECTED' | 'REMOVED';
    sortBy?:
      | 'seller.created_at'
      | 'seller.business_name'
      | 'seller.business_email'
      | 'seller.status';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<Seller[]>> {
    const qp = new URLSearchParams();
    qp.set('page', String(params?.page || 1));
    qp.set('limit', String(params?.limit || 10));
    if (params?.search?.trim()) qp.set('search', params.search.trim());
    if (params?.status) qp.set('status', params.status);
    qp.set('sortBy', params?.sortBy || 'seller.created_at');
    qp.set('sortOrder', params?.sortOrder || 'DESC');

    return apiClient.get<ApiResponse<Seller[]>>(
      `${ENDPOINTS.ADMIN_SELLERS.path}?${qp.toString()}`
    );
  },

  async approveSeller(sellerId: string): Promise<ApiResponse<unknown>> {
    return apiClient.patch<ApiResponse<unknown>>(
      `/admin/${encodeURIComponent(sellerId)}/approve`
    );
  },

  async rejectSeller(sellerId: string, reason: string): Promise<ApiResponse<unknown>> {
    return apiClient.patch<ApiResponse<unknown>>(
      `/admin/${encodeURIComponent(sellerId)}/reject`,
      { reason }
    );
  },

  async getShopsPaginated(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ShopStatus;
    sortBy?: 'shop.created_at' | 'shop.name' | 'shop.status';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<AdminShopRecord[]>> {
    const qp = new URLSearchParams();
    qp.set('page', String(params?.page || 1));
    qp.set('limit', String(params?.limit || 10));
    if (params?.search?.trim()) qp.set('search', params.search.trim());
    if (params?.status) qp.set('status', params.status);
    qp.set('sortBy', params?.sortBy || 'shop.created_at');
    qp.set('sortOrder', params?.sortOrder || 'DESC');

    return apiClient.get<ApiResponse<AdminShopRecord[]>>(
      `${ENDPOINTS.ADMIN_SHOPS.path}?${qp.toString()}`
    );
  },

  async getAdminShopDetails(shopId: string): Promise<ApiResponse<AdminShopRecord>> {
    return apiClient.get<ApiResponse<AdminShopRecord>>(
      `/admin/shops/${encodeURIComponent(shopId)}`
    );
  },

  async updateAdminShopStatus(
    shopId: string,
    status: ShopStatus
  ): Promise<ApiResponse<AdminShopRecord>> {
    return apiClient.patch<ApiResponse<AdminShopRecord>>(
      `/admin/shops/${encodeURIComponent(shopId)}/status`,
      { status }
    );
  },
};
