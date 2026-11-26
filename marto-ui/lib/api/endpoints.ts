export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface EndpointSpec {
  method: HttpMethod;
  path: string;
  available: boolean;
  description: string;
}

/**
 * Single source of truth for backend endpoint availability.
 * `available: true` MUST strictly reflect endpoints present in the latest api-json.json OpenAPI specification.
 * Flipping an endpoint from `false` to `true` when the backend ships it lights up the corresponding UI automatically.
 */
export const ENDPOINTS = {
  // Health & Session
  HEALTH: {
    method: 'GET',
    path: '/health',
    available: true,
    description: 'Public backend health check',
  },
  AUTH_SESSION: {
    method: 'GET',
    path: '/auth/session',
    available: true,
    description: 'Silent session check on app start',
  },
  AUTH_REFRESH: {
    method: 'POST',
    path: '/auth/refresh',
    available: true,
    description: 'Refresh access token using HttpOnly refresh_token cookie',
  },
  AUTH_LOGOUT: {
    method: 'POST',
    path: '/auth/logout',
    available: true,
    description: 'Clear active authentication session',
  },
  AUTH_VERIFY_EMAIL: {
    method: 'GET',
    path: '/auth/verify-email',
    available: true,
    description: 'Verify customer or seller email address via token',
  },
  AUTH_SELLER_LOGIN: {
    method: 'POST',
    path: '/auth/seller/login',
    available: true,
    description: 'Seller login (verified + admin-approved accounts only)',
  },
  AUTH_ADMIN_LOGIN: {
    method: 'POST',
    path: '/auth/admin/login',
    available: true,
    description: 'Super Admin login',
  },
  AUTH_REGISTER_SELLER: {
    method: 'POST',
    path: '/auth/register/seller',
    available: true,
    description: 'Seller & shop multipart registration',
  },
  AUTH_REGISTER_CUSTOMER: {
    method: 'POST',
    path: '/auth/register/customer',
    available: true,
    description: 'Customer registration',
  },
  AUTH_CUSTOMER_LOGIN: {
    method: 'POST',
    path: '/auth/customer/login',
    available: true,
    description: 'Customer login',
  },
  AUTH_CUSTOMER_RESEND_VERIFICATION: {
    method: 'POST',
    path: '/auth/customer/resend-verification',
    available: true,
    description: 'Resend customer verification link',
  },
  AUTH_CUSTOMER_FORGOT_PASSWORD: {
    method: 'POST',
    path: '/auth/customer/forgot-password',
    available: true,
    description: 'Request customer password reset email',
  },
  AUTH_CUSTOMER_RESET_PASSWORD: {
    method: 'POST',
    path: '/auth/customer/reset-password',
    available: true,
    description: 'Reset customer password using token',
  },

  // Sellers
  SELLER_APPLICATION_STATUS: {
    method: 'POST',
    path: '/sellers/application/status',
    available: true,
    description: 'Request seller application status update by email',
  },
  SELLER_MY_SHOP: {
    method: 'GET',
    path: '/shops/me',
    available: true,
    description: 'Authenticated seller shop details',
  },
  SELLER_UPDATE_SHOP: {
    method: 'PATCH',
    path: '/shops/me',
    available: true,
    description: 'Update authenticated seller shop details',
  },
  SELLER_UPDATE_SHOP_IMAGES: {
    method: 'PATCH',
    path: '/shops/me/images',
    available: true,
    description: 'Upload shop logo or cover image',
  },
  SELLER_UPDATE_SHOP_STATUS: {
    method: 'PATCH',
    path: '/shops/me/status',
    available: true,
    description: 'Set owned shop status to ACTIVE or INACTIVE',
  },

  // Shop Categories
  SHOP_CATEGORIES_ACTIVE: {
    method: 'GET',
    path: '/shop-categories/active',
    available: true,
    description: 'Public active marketplace shop categories',
  },
  ADMIN_CREATE_SHOP_CATEGORY: {
    method: 'POST',
    path: '/admin/shop-categories',
    available: true,
    description: 'Create marketplace shop category',
  },

  // Public Product Categories & Shop Collections
  PUBLIC_PRODUCT_CATEGORIES: {
    method: 'GET',
    path: '/product-categories',
    available: true,
    description: 'Active marketplace-wide product categories',
  },
  PUBLIC_PRODUCT_CATEGORIES_TREE: {
    method: 'GET',
    path: '/product-categories/tree',
    available: true,
    description: 'Active marketplace-wide product category tree',
  },
  PUBLIC_PRODUCT_CATEGORY_BY_ID: {
    method: 'GET',
    path: '/product-categories/:id',
    available: true,
    description: 'Get active product category details',
  },
  PUBLIC_SHOP_COLLECTIONS: {
    method: 'GET',
    path: '/shops/:shopId/product-categories',
    available: true,
    description: 'Active custom collections for a public shop',
  },

  // Seller Shop Collections
  SELLER_SHOP_COLLECTIONS: {
    method: 'GET',
    path: '/seller/shops/:shopId/product-categories',
    available: true,
    description: 'Paginated custom collections for an owned shop',
  },
  SELLER_SHOP_COLLECTIONS_TREE: {
    method: 'GET',
    path: '/seller/shops/:shopId/product-categories/tree',
    available: true,
    description: 'Custom collection tree for an owned shop',
  },
  SELLER_SHOP_COLLECTION_DETAIL: {
    method: 'GET',
    path: '/seller/shops/:shopId/product-categories/:id',
    available: true,
    description: 'Get a custom collection',
  },
  SELLER_SHOP_COLLECTION_CREATE: {
    method: 'POST',
    path: '/seller/shops/:shopId/product-categories',
    available: true,
    description: 'Create a custom collection',
  },
  SELLER_SHOP_COLLECTION_UPDATE: {
    method: 'PATCH',
    path: '/seller/shops/:shopId/product-categories/:id',
    available: true,
    description: 'Update a custom collection',
  },
  SELLER_SHOP_COLLECTION_STATUS: {
    method: 'PATCH',
    path: '/seller/shops/:shopId/product-categories/:id/status',
    available: true,
    description: 'Enable or disable a custom collection',
  },
  SELLER_SHOP_COLLECTION_DELETE: {
    method: 'DELETE',
    path: '/seller/shops/:shopId/product-categories/:id',
    available: true,
    description: 'Soft-remove a custom collection',
  },

  // Admin Product Categories & Seller Moderation
  ADMIN_PRODUCT_CATEGORIES: {
    method: 'GET',
    path: '/admin/product-categories',
    available: true,
    description: 'List platform and seller product categories',
  },
  ADMIN_PRODUCT_CATEGORY_CREATE: {
    method: 'POST',
    path: '/admin/product-categories',
    available: true,
    description: 'Create platform product category',
  },
  ADMIN_PRODUCT_CATEGORY_UPDATE: {
    method: 'PATCH',
    path: '/admin/product-categories/:id',
    available: true,
    description: 'Update platform product category',
  },
  ADMIN_PRODUCT_CATEGORY_STATUS: {
    method: 'PATCH',
    path: '/admin/product-categories/:id/status',
    available: true,
    description: 'Update platform category status',
  },
  ADMIN_PRODUCT_CATEGORY_DELETE: {
    method: 'DELETE',
    path: '/admin/product-categories/:id',
    available: true,
    description: 'Soft-remove platform category',
  },
  ADMIN_SELLER_COLLECTIONS: {
    method: 'GET',
    path: '/admin/product-categories/seller-categories',
    available: true,
    description: 'List seller collections for moderation',
  },
  ADMIN_SELLER_COLLECTION_STATUS: {
    method: 'PATCH',
    path: '/admin/product-categories/seller-categories/:id/status',
    available: true,
    description: 'Moderate seller collection status',
  },
  ADMIN_SELLER_COLLECTION_DELETE: {
    method: 'DELETE',
    path: '/admin/product-categories/seller-categories/:id',
    available: true,
    description: 'Remove seller collection as moderation action',
  },

  // Public & Seller Products
  PUBLIC_PRODUCTS: {
    method: 'GET',
    path: '/products',
    available: true,
    description: 'Browse active public products',
  },
  PUBLIC_PRODUCT_DETAIL: {
    method: 'GET',
    path: '/products/:id',
    available: true,
    description: 'Public product details',
  },
  SELLER_PRODUCTS: {
    method: 'GET',
    path: '/seller/shops/:shopId/products',
    available: true,
    description: 'Paginated seller shop products',
  },
  SELLER_PRODUCT_DETAIL: {
    method: 'GET',
    path: '/seller/shops/:shopId/products/:id',
    available: true,
    description: 'Seller shop product detail',
  },
  SELLER_PRODUCT_CREATE: {
    method: 'POST',
    path: '/seller/shops/:shopId/products',
    available: true,
    description: 'Create product for owned shop',
  },
  SELLER_PRODUCT_UPDATE: {
    method: 'PATCH',
    path: '/seller/shops/:shopId/products/:id',
    available: true,
    description: 'Update product for owned shop',
  },
  SELLER_PRODUCT_STATUS: {
    method: 'PATCH',
    path: '/seller/shops/:shopId/products/:id/status',
    available: true,
    description: 'Enable or disable seller product',
  },
  SELLER_PRODUCT_DELETE: {
    method: 'DELETE',
    path: '/seller/shops/:shopId/products/:id',
    available: true,
    description: 'Soft-remove seller product',
  },
  SELLER_PRODUCT_IMAGE_UPLOAD: {
    method: 'POST',
    path: '/seller/shops/:shopId/products/:id/images',
    available: true,
    description: 'Upload product images (max 8)',
  },
  SELLER_PRODUCT_IMAGE_PRIMARY: {
    method: 'PATCH',
    path: '/seller/shops/:shopId/products/:id/images/:imageId/primary',
    available: true,
    description: 'Set primary product image',
  },
  SELLER_PRODUCT_IMAGE_DELETE: {
    method: 'DELETE',
    path: '/seller/shops/:shopId/products/:id/images/:imageId',
    available: true,
    description: 'Delete product image',
  },

  // Admin Sellers & Shops
  ADMIN_SELLERS: {
    method: 'GET',
    path: '/admin/sellers',
    available: true,
    description: 'Paginated seller applications',
  },
  ADMIN_SELLER_APPROVE: {
    method: 'PATCH',
    path: '/admin/:sellerId/approve',
    available: true,
    description: 'Approve seller application',
  },
  ADMIN_SELLER_REJECT: {
    method: 'PATCH',
    path: '/admin/:sellerId/reject',
    available: true,
    description: 'Reject seller application',
  },
  ADMIN_SHOPS: {
    method: 'GET',
    path: '/admin/shops',
    available: true,
    description: 'Paginated marketplace shops',
  },
  ADMIN_SHOP_DETAIL: {
    method: 'GET',
    path: '/admin/shops/:shopId',
    available: true,
    description: 'Admin shop detail view',
  },
  ADMIN_SHOP_STATUS: {
    method: 'PATCH',
    path: '/admin/shops/:shopId/status',
    available: true,
    description: 'Update shop status (ACTIVE, INACTIVE, SUSPENDED, DISABLED)',
  },

  // =========================================================================
  // NOT YET IN OPENAPI SPECIFICATION (available: false -> <FeatureUnavailable />)
  // =========================================================================
  PUBLIC_SHOPS: {
    method: 'GET',
    path: '/shops',
    available: false,
    description: 'Public verified marketplace shop directory',
  },
  PUBLIC_SHOP_DETAIL: {
    method: 'GET',
    path: '/shops/:idOrSlug',
    available: false,
    description: 'Public shop storefront profile & delivery rules',
  },
  CUSTOMER_PROFILE: {
    method: 'GET',
    path: '/users/me',
    available: false,
    description: 'Customer profile read/update',
  },
  CUSTOMER_ADDRESSES: {
    method: 'GET',
    path: '/addresses',
    available: false,
    description: 'Customer saved delivery addresses CRUD',
  },
  ORDERS_CHECKOUT: {
    method: 'POST',
    path: '/orders',
    available: false,
    description: 'Create single-seller checkout order',
  },
  CUSTOMER_ORDERS: {
    method: 'GET',
    path: '/orders/my',
    available: false,
    description: 'Customer order history & tracking',
  },
  SELLER_ORDERS: {
    method: 'GET',
    path: '/seller/orders',
    available: false,
    description: 'Seller order fulfillment queue & status transitions',
  },
  SELLER_REVENUE: {
    method: 'GET',
    path: '/seller/revenue',
    available: false,
    description: 'Seller earnings & payout settlement ledger',
  },
  ADMIN_PRODUCTS: {
    method: 'GET',
    path: '/admin/products',
    available: false,
    description: 'Admin global product moderation directory',
  },
  ADMIN_ORDERS: {
    method: 'GET',
    path: '/admin/orders',
    available: false,
    description: 'Admin platform order audit ledger',
  },
  ADMIN_METRICS: {
    method: 'GET',
    path: '/admin/metrics',
    available: false,
    description: 'Admin platform GMV, order & fee analytics',
  },
  PLATFORM_SETTINGS: {
    method: 'GET',
    path: '/admin/settings',
    available: false,
    description: 'Platform fee & marketplace governance rules',
  },
  AUDIT_LOGS: {
    method: 'GET',
    path: '/admin/audit-logs',
    available: false,
    description: 'Security & administrative action logs',
  },
  PRODUCT_REVIEWS: {
    method: 'GET',
    path: '/products/:id/reviews',
    available: false,
    description: 'Customer product ratings & verified reviews',
  },
  NOTIFICATIONS: {
    method: 'GET',
    path: '/notifications',
    available: false,
    description: 'Real-time role-based notifications feed',
  },
} as const satisfies Record<string, EndpointSpec>;

export type EndpointKey = keyof typeof ENDPOINTS;
