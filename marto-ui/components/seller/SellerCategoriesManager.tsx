'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMyShop,
  useSellerCollections,
  useSellerCollectionMutations,
} from '@/hooks/queries/useMarketplaceQueries';
import { categoryFormSchema } from '@/lib/schemas';
import { SellerCategory } from '@/types';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type CollectionFormValues = z.infer<typeof categoryFormSchema>;

export function SellerCategoriesManager() {
  const { data: shopRes, isLoading: shopLoading } = useMyShop();
  const shopId = shopRes?.data?.id;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: collectionsRes, isLoading, error, refetch } = useSellerCollections(shopId, {
    page,
    limit: 10,
    search: search.trim() || undefined,
  });
  const mutations = useSellerCollectionMutations(shopId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SellerCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SellerCategory | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: '',
      sort_order: 0,
      image_url: '',
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    reset({ name: '', description: '', parent_id: '', sort_order: 0, image_url: '' });
    setModalOpen(true);
  };

  const openEditModal = (item: SellerCategory) => {
    setEditingItem(item);
    reset({
      name: item.name,
      description: item.description || '',
      parent_id: item.parent_id || '',
      sort_order: item.sort_order ?? 0,
      image_url: item.image_url || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      if (editingItem) {
        await mutations.updateCollection.mutateAsync({
          id: editingItem.id,
          dto: {
            name: values.name,
            description: values.description || undefined,
            parent_id: values.parent_id || null,
            sort_order: values.sort_order,
            image_url: values.image_url || undefined,
          },
        });
        toast.success('Collection updated');
      } else {
        await mutations.createCollection.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          parent_id: values.parent_id || undefined,
          sort_order: values.sort_order,
          image_url: values.image_url || undefined,
        });
        toast.success('Collection created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save collection.');
    }
  };

  const handleToggleStatus = async (item: SellerCategory) => {
    const nextStatus = item.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await mutations.toggleCollectionStatus.mutateAsync({
        id: item.id,
        status: nextStatus,
      });
      toast.success(`Collection ${nextStatus.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mutations.deleteCollection.mutateAsync(deleteTarget.id);
      toast.success('Collection removed');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete collection.');
    }
  };

  const collections = collectionsRes?.data || [];
  const meta = collectionsRes?.meta;

  const columns: DataTableColumn<SellerCategory>[] = [
    {
      key: 'name',
      header: 'Collection Name',
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
      render: (row) => <span className="tabular-nums text-text-muted">{row.sort_order}</span>,
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
        <div className="inline-flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={row.disabled_by_admin}
            title={row.disabled_by_admin ? 'Disabled by platform administrator' : 'Toggle status'}
            onClick={() => handleToggleStatus(row)}
          >
            <Power className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete ${row.name}`}
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
            Shop Collections
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Organize your storefront products into custom navigable collections.
          </p>
        </div>

        <Button type="button" variant="pill" onClick={openCreateModal} disabled={!shopId}>
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </Button>
      </div>

      <div className="flex items-center gap-3 max-w-sm">
        <Input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search collections..."
        />
      </div>

      <DataTable
        data={collections}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={shopLoading || isLoading}
        error={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        emptyTitle="No store collections yet"
        emptyDescription="Create custom collections so shoppers can filter items inside your shop."
        page={meta?.page || page}
        totalPages={meta?.totalPages || 1}
        totalItems={meta?.total}
        onPageChange={setPage}
      />

      {/* Create / Edit Dialog */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-3)] space-y-4">
            <h2 className="font-display font-bold text-lg text-on-surface">
              {editingItem ? 'Edit Collection' : 'Create Shop Collection'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Name *</label>
                <Input {...register('name')} placeholder="e.g. Summer Lawn 2026" />
                {errors.name && <p className="text-xs text-status-danger">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full rounded-lg border border-border-slate bg-surface-card px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-on-surface">Parent Collection</label>
                  <select
                    {...register('parent_id')}
                    className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
                  >
                    <option value="">Root Level</option>
                    {collections
                      .filter((c) => c.id !== editingItem?.id)
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

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="pill" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingItem ? 'Save' : 'Create'}</span>
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
        title="Delete Collection?"
        description={`Are you sure you want to remove "${deleteTarget?.name || ''}" from your shop?`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={mutations.deleteCollection.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
