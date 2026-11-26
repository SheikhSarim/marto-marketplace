import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import { Order, ApiResponse, OrderStatus, ALLOWED_ORDER_STATUS_TRANSITIONS } from '@/types';

export const orderStatusFlow: Record<OrderStatus, OrderStatus[]> = ALLOWED_ORDER_STATUS_TRANSITIONS;

export const orderService = {
  async getCustomerOrders(): Promise<ApiResponse<Order[]>> {
    throw new ApiNotAvailableError(
      'CUSTOMER_ORDERS',
      ENDPOINTS.CUSTOMER_ORDERS.method,
      ENDPOINTS.CUSTOMER_ORDERS.path,
      'Customer order history and tracking endpoints are not yet exposed by the backend.'
    );
  },

  async getSellerOrders(): Promise<ApiResponse<Order[]>> {
    throw new ApiNotAvailableError(
      'SELLER_ORDERS',
      ENDPOINTS.SELLER_ORDERS.method,
      ENDPOINTS.SELLER_ORDERS.path,
      'Seller order fulfillment endpoints are not yet exposed by the backend.'
    );
  },

  async getAdminOrders(): Promise<ApiResponse<Order[]>> {
    throw new ApiNotAvailableError(
      'ADMIN_ORDERS',
      ENDPOINTS.ADMIN_ORDERS.method,
      ENDPOINTS.ADMIN_ORDERS.path,
      'Admin order audit ledger endpoint is not yet exposed by the backend.'
    );
  },

  async placeOrder(): Promise<ApiResponse<Order>> {
    throw new ApiNotAvailableError(
      'ORDERS_CHECKOUT',
      ENDPOINTS.ORDERS_CHECKOUT.method,
      ENDPOINTS.ORDERS_CHECKOUT.path,
      'Order checkout creation endpoint is not yet exposed by the backend.'
    );
  },
};
