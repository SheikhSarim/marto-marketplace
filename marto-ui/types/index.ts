// Marto Marketplace - Core Domain Types, Enumerations & OpenAPI DTO Contracts

export type UserRole = "GUEST" | "CUSTOMER" | "SELLER" | "SUPER_ADMIN";

export type SellerStatus =
  | "PENDING"
  | "APPROVED"
  | "DISABLED"
  | "REJECTED"
  | "REMOVED";

export type ShopStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DISABLED";

export type ProductStatus = "ACTIVE" | "DISABLED" | "OUT_OF_STOCK" | "REMOVED";

export type CategoryStatus = "ACTIVE" | "DISABLED" | "REMOVED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  profile_pic?: string | null;
  avatarUrl?: string;
  phone?: string | null;
  is_email_verified: boolean;
  created_at?: string;
  createdAt: string;
  updated_at?: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}

export interface UpdateAvatarResponse {
  message: string;
  profile_pic: string;
}

export interface RequestEmailChangeDto {
  current_password: string;
  new_email: string;
}

export interface VerifyEmailChangeDto {
  token: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OpeningHourDay {
  open: string;
  close: string;
  is_closed: boolean;
}

export type ShopOpeningHours = Record<
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday",
  OpeningHourDay
>;

export interface Shop {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  logo_url?: string | null;
  cover_image_url?: string | null;
  coverImage?: string;
  cover_image?: string;
  category: string;
  category_name?: string;
  shop_category_id?: string;
  custom_category_name?: string;
  address: string;
  city: string;
  contactEmail: string;
  contact_email?: string;
  contactPhone: string;
  contact_phone?: string;
  openingHours?: string;
  opening_hours?: ShopOpeningHours | null;
  deliveryInfo: string;
  delivery_information?: string;
  deliveryFee?: number | null;
  estimatedDeliveryTime?: string;
  rating?: number;
  totalReviews?: number;
  status: ShopStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  city: string;
  status: SellerStatus;
  approved?: boolean;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  created_at?: string;
  business_name?: string;
  business_email?: string;
  registeredDate: string;
  approvedDate?: string;
  shopId?: string;
  notes?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    email_verified?: boolean;
  };
  shops?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export interface Category {
  id: string;
  sellerId?: string | null;
  shop_id?: string | null;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  image?: string;
  image_url?: string;
  parent_id?: string | null;
  parent?: { id: string; name: string; slug?: string } | null;
  children?: Category[];
  sort_order?: number;
  scope?: "PLATFORM" | "SELLER";
  status: CategoryStatus;
  productCount?: number;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type DiscountType = "NONE" | "PERCENTAGE" | "FIXED";

export type ProductAvailability = "IN_STOCK" | "OUT_OF_STOCK";

export interface ProductImage {
  id: string;
  url: string;
  image_url?: string;
  is_primary: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  sellerId: string;
  shopId: string;
  shopName?: string;
  shopCity?: string;
  categoryId: string;
  primary_category_id?: string;
  primaryCategoryName?: string;
  shop_category_ids?: string[];
  shop_categories?: Array<{ id: string; name: string; slug?: string }>;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  discount_type?: DiscountType;
  discount_value?: number;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  finalPrice: number;
  images: string[];
  productImages?: ProductImage[];
  stock: number;
  low_stock_threshold?: number;
  brand: string;
  tags: string[];
  weightKg?: number;
  prepaidFlag?: boolean;
  is_prepaid_only?: boolean;
  sold_count?: number;
  status: ProductStatus;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sellerId: string;
  shopId: string;
  shopName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  sellerEarning: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    area: string;
    city: string;
    postalCode: string;
  };
  deliveryOption: string;
  trackingNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  platformName: string;
  currency: string;
  platformFeePerOrder: number;
  sellerApprovalRequired: boolean;
  multiSellerCartEnabled: boolean;
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  targetType: "SELLER" | "SHOP" | "PRODUCT" | "CATEGORY" | "ORDER" | "SETTINGS";
  targetId: string;
  details: string;
  timestamp: string;
}

export interface CartItem {
  product: Product;
  shop: {
    id: string;
    name: string;
    city?: string;
    deliveryInfo?: string;
    deliveryFee?: number | null;
  };
  sellerId: string;
  quantity: number;
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp?: string;
}

export interface RegisterCustomerDto {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginCustomerDto {
  email: string;
  password: string;
}

export interface EmailDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: UserRole;
  recipientId?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "ORDER" | "SELLER" | "PRODUCT" | "SYSTEM";
}

export interface MarketplaceShopCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  status?: CategoryStatus;
  created_at?: string;
}

export interface CreateShopCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateShopDto {
  name?: string;
  description?: string;
  shop_category_id?: string;
  custom_category_name?: string;
  address?: string;
  city?: string;
  contact_phone?: string;
  contact_email?: string;
  opening_hours?: ShopOpeningHours | null;
  delivery_information?: string;
}

export interface SellerCategory {
  id: string;
  seller_id?: string;
  sellerId?: string;
  shop_id?: string;
  shop?: { id: string; name: string; status?: string } | null;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  parent?: { id: string; name: string; slug?: string } | null;
  children?: SellerCategory[];
  sort_order: number;
  scope?: "PLATFORM" | "SELLER";
  status: CategoryStatus;
  disabled_by_admin?: boolean;
  products_count?: number;
  productCount?: number;
  image?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  image_url?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parent_id?: string | null;
  sort_order?: number;
  image_url?: string;
}

export interface UpdateCategoryStatusDto {
  status: "ACTIVE" | "DISABLED";
}

export type CreateSellerCategoryDto = CreateCategoryDto;
export type UpdateSellerCategoryDto = UpdateCategoryDto;

// Strictly aligned with OpenAPI CreateProductDto (no undocumented sku field)
export interface CreateProductDto {
  name: string;
  description?: string;
  brand?: string;
  primary_category_id: string;
  shop_category_ids?: string[];
  price: number;
  discount_type?: DiscountType;
  discount_value?: number;
  sale_starts_at?: string;
  sale_ends_at?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  weight?: number;
  is_prepaid_only?: boolean;
  tags?: string[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface UpdateProductStatusDto {
  status: "ACTIVE" | "DISABLED";
}

export interface AdminShopRecord {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  category_name?: string;
  category?: string;
  address?: string;
  city?: string;
  contact_phone?: string;
  contact_email?: string;
  delivery_information?: string;
  deliveryFee?: number | null;
  rating?: number;
  status: ShopStatus;
  created_at: string;
  updated_at?: string;
  seller?: {
    id: string;
    business_name: string;
    business_email: string;
    status: SellerStatus;
    user?: {
      id: string;
      name: string;
      email: string;
      email_verified?: boolean;
    };
  };
}
