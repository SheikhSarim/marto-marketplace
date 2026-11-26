import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import { ApiResponse } from '@/types';

export interface SellerRegistrationData {
  name: string;
  email: string;
  password: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  cnic: string;
  business_address: string;
  city: string;
  shop_name: string;
  shop_description: string;
  shop_category: string;
  custom_category_name?: string;
  delivery_information: string;
  shop_logo?: File | null;
  shop_cover_image?: File | null;
}

export interface SellerRevenueSummary {
  totalRevenue: number;
  pendingPayout: number;
  platformFeesDeducted: number;
  completedOrders: number;
}

export const sellerService = {
  async registerSeller(formData: FormData): Promise<ApiResponse<unknown>> {
    if (!ENDPOINTS.AUTH_REGISTER_SELLER.available) {
      throw new ApiNotAvailableError(
        'AUTH_REGISTER_SELLER',
        'POST',
        ENDPOINTS.AUTH_REGISTER_SELLER.path
      );
    }
    return apiClient.post<ApiResponse<unknown>>(ENDPOINTS.AUTH_REGISTER_SELLER.path, formData, {
      skipAuth: true,
      skipRefreshRetry: true,
    });
  },

  async checkApplicationStatus(email: string): Promise<ApiResponse<unknown>> {
    if (!ENDPOINTS.SELLER_APPLICATION_STATUS.available) {
      throw new ApiNotAvailableError(
        'SELLER_APPLICATION_STATUS',
        'POST',
        ENDPOINTS.SELLER_APPLICATION_STATUS.path
      );
    }
    return apiClient.post<ApiResponse<unknown>>(
      ENDPOINTS.SELLER_APPLICATION_STATUS.path,
      { email: email.trim() },
      { skipAuth: true, skipRefreshRetry: true }
    );
  },

  async getSellerRevenue(): Promise<ApiResponse<SellerRevenueSummary>> {
    throw new ApiNotAvailableError(
      'SELLER_REVENUE',
      ENDPOINTS.SELLER_REVENUE.method,
      ENDPOINTS.SELLER_REVENUE.path,
      'Seller revenue analytics and payout ledger endpoints are not yet published in the backend API.'
    );
  },
};
