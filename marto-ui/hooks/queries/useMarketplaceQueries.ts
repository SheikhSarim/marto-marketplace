import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, ProductFilterParams } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { shopService } from '@/services/shop.service';
import { adminService } from '@/services/admin.service';
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateShopCategoryDto,
  ProductAvailability,
  ProductStatus,
  ShopStatus,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateShopDto,
} from '@/types';

export const queryKeys = {
  publicProducts: (filters?: ProductFilterParams) => ['publicProducts', filters] as const,
  publicProduct: (id: string) => ['publicProduct', id] as const,
  publicCategories: ['publicCategories'] as const,
  publicCategoryTree: ['publicCategoryTree'] as const,
  publicShopCollections: (shopId: string) => ['publicShopCollections', shopId] as const,
  activeShopCategories: ['activeShopCategories'] as const,
  myShop: ['myShop'] as const,
  sellerProducts: (shopId: string, params?: Record<string, unknown>) =>
    ['sellerProducts', shopId, params] as const,
  sellerCollections: (shopId: string, params?: Record<string, unknown>) =>
    ['sellerCollections', shopId, params] as const,
  sellerCollectionTree: (shopId: string) => ['sellerCollectionTree', shopId] as const,
  adminSellers: (params?: Record<string, unknown>) => ['adminSellers', params] as const,
  adminShops: (params?: Record<string, unknown>) => ['adminShops', params] as const,
  adminShopDetail: (shopId: string) => ['adminShopDetail', shopId] as const,
  adminProductCategories: ['adminProductCategories'] as const,
  adminSellerCollections: ['adminSellerCollections'] as const,
};

// Public Storefront Queries
export function usePublicProducts(filters: ProductFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.publicProducts(filters),
    queryFn: () => productService.getPublicProducts(filters),
  });
}

export function usePublicProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.publicProduct(id),
    queryFn: () => productService.getPublicProductById(id),
    enabled: Boolean(id),
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: queryKeys.publicCategories,
    queryFn: () => categoryService.getPublicCategories(),
  });
}

export function usePublicCategoryTree() {
  return useQuery({
    queryKey: queryKeys.publicCategoryTree,
    queryFn: () => categoryService.getPublicCategoryTree(),
  });
}

export function usePublicShopCollections(shopId: string) {
  return useQuery({
    queryKey: queryKeys.publicShopCollections(shopId),
    queryFn: () => categoryService.getPublicShopCollections(shopId),
    enabled: Boolean(shopId),
  });
}

export function useActiveShopCategories() {
  return useQuery({
    queryKey: queryKeys.activeShopCategories,
    queryFn: () => categoryService.getActiveShopCategories(),
  });
}

// Seller Queries & Mutations
export function useMyShop(enabled = true) {
  return useQuery({
    queryKey: queryKeys.myShop,
    queryFn: () => shopService.getMyShop(),
    enabled,
  });
}

export function useUpdateMyShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateShopDto) => shopService.updateMyShop(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.myShop }),
  });
}

export function useUpdateMyShopImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => shopService.updateMyShopImages(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.myShop }),
  });
}

export function useUpdateMyShopStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: 'ACTIVE' | 'INACTIVE') => shopService.updateMyShopStatus(status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.myShop }),
  });
}

export function useSellerProducts(
  shopId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProductStatus;
    primary_category_id?: string;
    shop_category_id?: string;
    availability?: ProductAvailability;
    sortBy?: ProductFilterParams['sortBy'];
  }
) {
  return useQuery({
    queryKey: queryKeys.sellerProducts(shopId || '', params),
    queryFn: () => productService.getSellerShopProducts(shopId!, params),
    enabled: Boolean(shopId),
  });
}

export function useSellerProductMutations(shopId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    if (shopId) qc.invalidateQueries({ queryKey: ['sellerProducts', shopId] });
    qc.invalidateQueries({ queryKey: ['publicProducts'] });
  };

  return {
    createProduct: useMutation({
      mutationFn: (dto: CreateProductDto) => productService.createSellerShopProduct(shopId!, dto),
      onSuccess: invalidate,
    }),
    updateProduct: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
        productService.updateSellerShopProduct(shopId!, id, dto),
      onSuccess: invalidate,
    }),
    toggleStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
        productService.updateSellerShopProductStatus(shopId!, id, status),
      onSuccess: invalidate,
    }),
    deleteProduct: useMutation({
      mutationFn: (id: string) => productService.deleteSellerShopProduct(shopId!, id),
      onSuccess: invalidate,
    }),
  };
}

export function useSellerCollections(
  shopId: string | undefined,
  params?: { page?: number; limit?: number; search?: string }
) {
  return useQuery({
    queryKey: queryKeys.sellerCollections(shopId || '', params),
    queryFn: () => categoryService.getSellerShopCollections(shopId!, params),
    enabled: Boolean(shopId),
  });
}

export function useSellerCollectionMutations(shopId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    if (shopId) {
      qc.invalidateQueries({ queryKey: ['sellerCollections', shopId] });
      qc.invalidateQueries({ queryKey: queryKeys.sellerCollectionTree(shopId) });
    }
  };
  return {
    createCollection: useMutation({
      mutationFn: (dto: CreateCategoryDto) =>
        categoryService.createSellerShopCollection(shopId!, dto),
      onSuccess: invalidate,
    }),
    updateCollection: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
        categoryService.updateSellerShopCollection(shopId!, id, dto),
      onSuccess: invalidate,
    }),
    toggleCollectionStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
        categoryService.updateSellerShopCollectionStatus(shopId!, id, status),
      onSuccess: invalidate,
    }),
    deleteCollection: useMutation({
      mutationFn: (id: string) => categoryService.removeSellerShopCollection(shopId!, id),
      onSuccess: invalidate,
    }),
  };
}

// Admin Queries & Mutations
export function useAdminSellers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'DISABLED' | 'REJECTED' | 'REMOVED';
  sortBy?: 'seller.created_at' | 'seller.business_name' | 'seller.business_email' | 'seller.status';
  sortOrder?: 'ASC' | 'DESC';
}) {
  return useQuery({
    queryKey: queryKeys.adminSellers(params),
    queryFn: () => adminService.getSellersPaginated(params),
  });
}

export function useAdminShops(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ShopStatus;
  sortBy?: 'shop.created_at' | 'shop.name' | 'shop.status';
  sortOrder?: 'ASC' | 'DESC';
}) {
  return useQuery({
    queryKey: queryKeys.adminShops(params),
    queryFn: () => adminService.getShopsPaginated(params),
  });
}

export function useAdminSellerActions() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['adminSellers'] });
    qc.invalidateQueries({ queryKey: ['adminShops'] });
  };
  return {
    approveSeller: useMutation({
      mutationFn: (sellerId: string) => adminService.approveSeller(sellerId),
      onSuccess: invalidate,
    }),
    rejectSeller: useMutation({
      mutationFn: ({ sellerId, reason }: { sellerId: string; reason: string }) =>
        adminService.rejectSeller(sellerId, reason),
      onSuccess: invalidate,
    }),
    updateShopStatus: useMutation({
      mutationFn: ({ shopId, status }: { shopId: string; status: ShopStatus }) =>
        adminService.updateAdminShopStatus(shopId, status),
      onSuccess: invalidate,
    }),
  };
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.adminProductCategories,
    queryFn: () => categoryService.getAdminProductCategories(),
  });
}

export function useAdminSellerCollections() {
  return useQuery({
    queryKey: queryKeys.adminSellerCollections,
    queryFn: () => categoryService.getAdminSellerCollections(),
  });
}

export function useAdminCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.adminProductCategories });
    qc.invalidateQueries({ queryKey: queryKeys.adminSellerCollections });
    qc.invalidateQueries({ queryKey: queryKeys.activeShopCategories });
    qc.invalidateQueries({ queryKey: queryKeys.publicCategories });
  };
  return {
    createShopCategory: useMutation({
      mutationFn: (dto: CreateShopCategoryDto) => categoryService.createAdminShopCategory(dto),
      onSuccess: invalidate,
    }),
    createProductCategory: useMutation({
      mutationFn: (dto: CreateCategoryDto) => categoryService.createCategory(dto),
      onSuccess: invalidate,
    }),
    updateProductCategory: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
        categoryService.updateCategory(id, dto),
      onSuccess: invalidate,
    }),
    updateProductCategoryStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
        categoryService.updateCategoryStatus(id, status),
      onSuccess: invalidate,
    }),
    deleteProductCategory: useMutation({
      mutationFn: (id: string) => categoryService.removeAdminProductCategory(id),
      onSuccess: invalidate,
    }),
    moderateSellerCollectionStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
        categoryService.updateAdminSellerCollectionStatus(id, status),
      onSuccess: invalidate,
    }),
    deleteSellerCollection: useMutation({
      mutationFn: (id: string) => categoryService.removeAdminSellerCollection(id),
      onSuccess: invalidate,
    }),
  };
}
