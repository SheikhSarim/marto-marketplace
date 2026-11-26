'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminCategories,
  useAdminSellerCollections,
  useActiveShopCategories,
  useAdminCategoryMutations,
} from '@/hooks/queries/useMarketplaceQueries';
import { categoryFormSchema } from '@/lib/schemas';
import { Category, SellerCategory } from '@/types';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function AdminCategoriesManager() {
  const [activeTab, setActiveTab] = useState<'product' | 'shop' | 'seller_collections'>('product');

  const { data: productCatsRes, isLoading: catsLoading, refetch: refetchCats } = useAdminCategories();
  const { data: shopCatsRes, isLoading: shopCatsLoading } = useActiveShopCategories();
  const { data: sellerColsRes, isLoading: colsLoading, refetch: refetchCols } = useAdminSellerCollections();
  const mutations = useAdminCategoryMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'product' | 'shop'>('product');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'seller_collection';
    id: string;
    name: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '', parent_id: '', sort_order: 0, image_url: '' },
  });

  const openCreate = (mode: 'product' | 'shop') => {
    setModalMode(mode);
    setEditingCat(null);
    reset({ name: '', description: '', parent_id: '', sort_order: 0, image_url: '' });
    setModalOpen(true);
  };

  const openEditProductCat = (cat: Category) => {
    setModalMode('product');
    setEditingCat(cat);
    reset({
      name: cat.name,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      sort_order: cat.sort_order ?? 0,
      image_url: cat.image_url || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (modalMode === 'shop') {
        await mutations.createShopCategory.mutateAsync({
          name: values.name,
          description: values.description || undefined,
        });
        toast.success('Shop onboarding category created');
      } else if (editingCat) {
        await mutations.updateProductCategory.mutateAsync({
          id: editingCat.id,
          dto: {
            name: values.name,
            description: values.description || undefined,
            parent_id: values.parent_id || null,
            sort_order: values.sort_order,
            image_url: values.image_url || undefined,
          },
        });
        toast.success('Product category updated');
      } else {
        await mutations.createProductCategory.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          parent_id: values.parent_id || undefined,
          sort_order: values.sort_order,
          image_url: values.image_url || undefined,
        });
        toast.success('Product category created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const handleToggleProductCatStatus = async (cat: Category) => {
    const next = cat.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await mutations.updateProductCategoryStatus.mutateAsync({ id: cat.id, status: next });
      toast.success(`Category ${next.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleToggleSellerColStatus = async (col: SellerCategory) => {
    const next = col.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await mutations.moderateSellerCollectionStatus.mutateAsync({ id: col.id, status: next });
      toast.success(`Seller collection ${next.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to moderate collection.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'product') {
        await mutations.deleteProductCategory.mutateAsync(deleteTarget.id);
      } else {
        await mutations.deleteSellerCollection.mutateAsync(deleteTarget.id);
      }
      toast.success('Category deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const productCategories = productCatsRes?.data || [];
  const shopCategories = shopCatsRes?.data || [];
  const sellerCollections = sellerColsRes?.data || [];

  const productColumns: DataTableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Category',
      render: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.name}</p>
          {row.description && (
            <p className="text-xs text-text-muted line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'sort_order',
      header: 'Order',
      render: (row) => <span className="tabular-nums text-text-muted">{row.sort_order ?? 0}</span>,
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
          <Button type="button" variant="ghost" size="sm" onClick={() => openEditProductCat(row)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleProductCatStatus(row)}>
            <Power className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget({ type: 'product', id: row.id, name: row.name })}
            className="text-status-danger hover:text-status-danger"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const sellerColColumns: DataTableColumn<SellerCategory>[] = [
    {
      key: 'name',
      header: 'Collection',
      render: (row) => (
        <div>
          <p className="font-semibold text-on-surface">{row.name}</p>
          <p className="text-xs text-text-muted">{row.shop?.name || 'Merchant Shop'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Moderation',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleToggleSellerColStatus(row)}>
            <Power className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setDeleteTarget({ type: 'seller_collection', id: row.id, name: row.name })
            }
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
            Marketplace Taxonomy Governance
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Manage platform-wide product categories, merchant onboarding types, and seller collections.
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'shop' ? (
            <Button type="button" variant="pill" onClick={() => openCreate('shop')}>
              <Plus className="w-4 h-4" />
              <span>New Shop Category</span>
            </Button>
          ) : activeTab === 'product' ? (
            <Button type="button" variant="pill" onClick={() => openCreate('product')}>
              <Plus className="w-4 h-4" />
              <span>New Product Category</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border-slate pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('product')}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer ${
            activeTab === 'product'
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-card border border-border-slate text-on-surface'
          }`}
        >
          Platform Product Categories ({productCategories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-card border border-border-slate text-on-surface'
          }`}
        >
          Shop Onboarding Categories ({shopCategories.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seller_collections')}
          className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer ${
            activeTab === 'seller_collections'
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-card border border-border-slate text-on-surface'
          }`}
        >
          Seller Collections Audit ({sellerCollections.length})
        </button>
      </div>

      {activeTab === 'product' && (
        <DataTable
          data={productCategories}
          columns={productColumns}
          keyExtractor={(row) => row.id}
          isLoading={catsLoading}
          onRetry={() => refetchCats()}
          emptyTitle="No platform product categories"
          emptyDescription="Create global categories for sellers to classify their products."
        />
      )}

      {activeTab === 'shop' && (
        <DataTable
          data={shopCategories}
          columns={[
            {
              key: 'name',
              header: 'Shop Type',
              render: (row) => <span className="font-semibold text-on-surface">{row.name}</span>,
            },
            {
              key: 'description',
              header: 'Description',
              render: (row) => (
                <span className="text-sm text-text-muted">{row.description || '—'}</span>
              ),
            },
          ]}
          keyExtractor={(row) => row.id}
          isLoading={shopCatsLoading}
          emptyTitle="No active shop categories"
          emptyDescription="Add categories shown during merchant onboarding."
        />
      )}

      {activeTab === 'seller_collections' && (
        <DataTable
          data={sellerCollections}
          columns={sellerColColumns}
          keyExtractor={(row) => row.id}
          isLoading={colsLoading}
          onRetry={() => refetchCols()}
          emptyTitle="No seller collections to moderate"
          emptyDescription="Custom shop collections created by merchants appear here."
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-3)] space-y-4">
            <h2 className="font-display font-bold text-lg text-on-surface">
              {modalMode === 'shop'
                ? 'New Shop Onboarding Category'
                : editingCat
                ? 'Edit Product Category'
                : 'Create Product Category'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Name *</label>
                <Input {...register('name')} placeholder="Category name" />
                {errors.name && <p className="text-xs text-status-danger">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full rounded-lg border border-border-slate bg-surface-card px-3 py-2 text-sm text-on-surface"
                />
              </div>

              {modalMode === 'product' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Parent Category</label>
                    <select
                      {...register('parent_id')}
                      className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface"
                    >
                      <option value="">Root Level</option>
                      {productCategories
                        .filter((c) => c.id !== editingCat?.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface">Sort Order</label>
                    <Input
                      type="number"
                      min={0}
                      {...register('sort_order', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="pill" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Category?"
        description={`Are you sure you want to remove "${deleteTarget?.name || ''}"?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={
          mutations.deleteProductCategory.isPending || mutations.deleteSellerCollection.isPending
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
