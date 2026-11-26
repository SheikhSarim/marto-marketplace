'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  ImagePlus,
  Star,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useMyShop,
  useSellerProducts,
  useSellerProductMutations,
  usePublicCategories,
  useSellerCollections,
} from '@/hooks/queries/useMarketplaceQueries';
import { productService } from '@/services/product.service';
import { productFormSchema } from '@/lib/schemas';
import { Product } from '@/types';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { SafeImage } from '@/components/ui/SafeImage';
import { PriceTag } from '@/components/ui/PriceTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type ProductFormValues = z.infer<typeof productFormSchema>;

interface SellerProductsManagerProps {
  initialMode?: 'list' | 'create' | 'edit';
  editProductId?: string;
}

export function SellerProductsManager({
  initialMode = 'list',
  editProductId,
}: SellerProductsManagerProps) {
  const { data: shopRes, isLoading: shopLoading } = useMyShop();
  const shopId = shopRes?.data?.id;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const {
    data: productsRes,
    isLoading,
    error,
    refetch,
  } = useSellerProducts(shopId, {
    page,
    limit: 12,
    search: search.trim() || undefined,
  });

  const { data: publicCatsRes } = usePublicCategories();
  const { data: sellerColsRes } = useSellerCollections(shopId, { limit: 100 });
  const mutations = useSellerProductMutations(shopId);

  const [formOpen, setFormOpen] = useState(initialMode === 'create' || initialMode === 'edit');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const primaryCategories = (publicCatsRes?.data || []).filter((c) => c.status === 'ACTIVE');
  const shopCollections = (sellerColsRes?.data || []).filter((c) => c.status === 'ACTIVE');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      primary_category_id: '',
      shop_category_ids: [],
      price: 0,
      discount_type: 'NONE',
      discount_value: 0,
      stock_quantity: 0,
      low_stock_threshold: 5,
      is_prepaid_only: false,
      tags: [],
    },
  });

  const discountType = watch('discount_type');
  const selectedCollectionIds = watch('shop_category_ids') || [];

  // Load requested product when entering in edit mode directly via route
  useEffect(() => {
    if (initialMode !== 'edit' || !editProductId || !shopId) return;
    productService
      .getSellerShopProductById(shopId, editProductId)
      .then((res) => {
        if (res.data) openEditModal(res.data);
      })
      .catch(() => {
        toast.error('Could not load requested product for editing.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, editProductId, shopId]);

  const openCreateModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      brand: '',
      primary_category_id: primaryCategories[0]?.id || '',
      shop_category_ids: [],
      price: 0,
      discount_type: 'NONE',
      discount_value: 0,
      stock_quantity: 0,
      low_stock_threshold: 5,
      is_prepaid_only: false,
      tags: [],
    });
    setFormOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '',
      brand: product.brand || '',
      primary_category_id: product.primary_category_id || product.categoryId || '',
      shop_category_ids: product.shop_category_ids || [],
      price: product.price,
      discount_type: product.discount_type || 'NONE',
      discount_value: product.discount_value || 0,
      stock_quantity: product.stock,
      low_stock_threshold: product.low_stock_threshold ?? 5,
      weight: product.weightKg,
      is_prepaid_only: Boolean(product.is_prepaid_only),
      tags: product.tags || [],
    });
    setFormOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        brand: values.brand || undefined,
        primary_category_id: values.primary_category_id,
        shop_category_ids: values.shop_category_ids?.length ? values.shop_category_ids : undefined,
        price: values.price,
        discount_type: values.discount_type,
        discount_value: values.discount_type === 'NONE' ? 0 : values.discount_value,
        stock_quantity: values.stock_quantity,
        low_stock_threshold: values.low_stock_threshold,
        weight: values.weight,
        is_prepaid_only: values.is_prepaid_only,
        tags: values.tags,
      };

      if (editingProduct) {
        const res = await mutations.updateProduct.mutateAsync({
          id: editingProduct.id,
          dto: payload,
        });
        setEditingProduct(res.data);
        toast.success('Product updated');
      } else {
        const res = await mutations.createProduct.mutateAsync(payload);
        setEditingProduct(res.data);
        toast.success('Product created — you can now upload up to 8 images.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product.');
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await mutations.toggleStatus.mutateAsync({ id: product.id, status: nextStatus });
      toast.success(`Product ${nextStatus.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle product status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await mutations.deleteProduct.mutateAsync(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product.');
    }
  };

  const handleUploadProductImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!shopId || !editingProduct) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingCount = editingProduct.productImages?.length || 0;
    if (existingCount + files.length > 8) {
      toast.error('Maximum 8 images allowed per product.');
      return;
    }

    const fd = new FormData();
    for (const f of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`${f.name} must be JPEG, PNG, or WebP.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 5 MB limit.`);
        return;
      }
      fd.append('images', f);
    }

    setUploadingImage(true);
    try {
      const updated = await productService.uploadSellerProductImages(shopId, editingProduct.id, fd);
      setEditingProduct(updated.data);
      refetch();
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!shopId || !editingProduct) return;
    try {
      const updated = await productService.setPrimaryProductImage(shopId, editingProduct.id, imageId);
      setEditingProduct(updated.data);
      refetch();
      toast.success('Primary thumbnail updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set primary image.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!shopId || !editingProduct) return;
    try {
      const updated = await productService.deleteProductImage(shopId, editingProduct.id, imageId);
      setEditingProduct(updated.data);
      refetch();
      toast.success('Image removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove image.');
    }
  };

  const products = productsRes?.data || [];
  const meta = productsRes?.meta;

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl border border-border-slate bg-surface-container-low overflow-hidden shrink-0">
            <SafeImage src={row.images[0]} alt={row.name} fill sizes="44px" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-on-surface truncate max-w-[220px]">{row.name}</p>
            <p className="text-xs text-text-muted">{row.primaryCategoryName || 'Uncategorized'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => (
        <PriceTag
          price={row.finalPrice}
          compareAtPrice={row.finalPrice < row.price ? row.price : null}
          size="sm"
        />
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) => (
        <span className="tabular-nums font-medium">
          {row.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => openEditModal(row)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleProductStatus(row)}>
            <Power className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            className="text-status-danger hover:text-status-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            Product Catalog
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Create and manage SKUs, inventory levels, promotional pricing, and up to 8 images per product.
          </p>
        </div>

        <Button type="button" variant="pill" onClick={openCreateModal} disabled={!shopId}>
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search your catalog..."
        />
      </div>

      <DataTable
        data={products}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={shopLoading || isLoading}
        error={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        emptyTitle="No products published yet"
        emptyDescription="Add your first product to make it discoverable on Marto."
        page={meta?.page || page}
        totalPages={meta?.totalPages || 1}
        totalItems={meta?.total}
        onPageChange={setPage}
      />

      {/* Product Create/Edit Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-3)] space-y-6">
            <div className="flex items-center justify-between border-b border-border-slate pb-3">
              <h2 className="font-display font-bold text-xl text-on-surface">
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Create New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-on-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface">Product Name *</label>
                  <Input {...register('name')} placeholder="Product title" />
                  {errors.name && <p className="text-xs text-status-danger">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Primary Category *</label>
                  <select
                    {...register('primary_category_id')}
                    className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="">Select platform category</option>
                    {primaryCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.primary_category_id && (
                    <p className="text-xs text-status-danger">{errors.primary_category_id.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Brand</label>
                  <Input {...register('brand')} placeholder="Optional brand name" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Base Price (PKR) *</label>
                  <Input type="number" step="1" min={1} {...register('price', { valueAsNumber: true })} />
                  {errors.price && <p className="text-xs text-status-danger">{errors.price.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Stock Quantity *</label>
                  <Input type="number" min={0} {...register('stock_quantity', { valueAsNumber: true })} />
                  {errors.stock_quantity && (
                    <p className="text-xs text-status-danger">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Discount Type</label>
                  <select
                    {...register('discount_type')}
                    className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface"
                  >
                    <option value="NONE">No Discount</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (PKR)</option>
                  </select>
                </div>

                {discountType !== 'NONE' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Discount Value</label>
                    <Input
                      type="number"
                      min={0}
                      {...register('discount_value', { valueAsNumber: true })}
                    />
                  </div>
                )}

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-on-surface">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full rounded-lg border border-border-slate bg-surface-card px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  />
                </div>

                {shopCollections.length > 0 && (
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-on-surface">Shop Collections</label>
                    <div className="flex flex-wrap gap-2">
                      {shopCollections.map((col) => {
                        const checked = selectedCollectionIds.includes(col.id);
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => {
                              const next = checked
                                ? selectedCollectionIds.filter((id) => id !== col.id)
                                : [...selectedCollectionIds, col.id];
                              setValue('shop_category_ids', next);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                              checked
                                ? 'bg-primary-container text-on-primary border-primary-container'
                                : 'bg-surface-page text-on-surface border-border-slate'
                            }`}
                          >
                            {col.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <label className="sm:col-span-2 inline-flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer">
                  <input type="checkbox" {...register('is_prepaid_only')} className="rounded" />
                  <span>Require prepaid payment (disable Cash on Delivery for this item)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Close
                </Button>
                <Button type="submit" variant="pill" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </Button>
              </div>
            </form>

            {/* Product Gallery Management (once product exists) */}
            {editingProduct && (
              <div className="border-t border-border-slate pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-on-surface">
                      Product Gallery ({editingProduct.productImages?.length || 0}/8)
                    </h3>
                    <p className="text-xs text-text-muted">JPEG, PNG, or WebP up to 5 MB each.</p>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-page border border-border-slate hover:border-primary text-xs font-semibold text-on-surface cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUploadProductImages}
                      className="sr-only"
                    />
                  </label>
                </div>

                {editingProduct.productImages && editingProduct.productImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {editingProduct.productImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-square rounded-xl border border-border-slate bg-surface-container-low overflow-hidden group"
                      >
                        <SafeImage src={img.url} alt="Product image" fill sizes="140px" />
                        <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1 bg-surface-midnight/75 rounded-lg p-1 text-white">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img.id)}
                            title={img.is_primary ? 'Primary image' : 'Set as primary'}
                            className="p-1 rounded hover:bg-white/15 cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                img.is_primary ? 'fill-amber-400 text-amber-400' : 'text-white'
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            aria-label="Delete image"
                            className="p-1 rounded hover:bg-rose-500/40 text-rose-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Product?"
        description={`Are you sure you want to remove "${deleteTarget?.name || ''}"? This cannot be undone.`}
        confirmLabel="Delete Product"
        variant="destructive"
        isLoading={mutations.deleteProduct.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
