'use client';

import React, { useState } from 'react';
import { Store, Eye, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminShops,
  useAdminSellerActions,
} from '@/hooks/queries/useMarketplaceQueries';
import { adminService } from '@/services/admin.service';
import { AdminShopRecord, ShopStatus } from '@/types';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { SafeImage } from '@/components/ui/SafeImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/format';

export function AdminShopsManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShopStatus | ''>('');

  const { data: shopsRes, isLoading, error, refetch } = useAdminShops({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
  });
  const actions = useAdminSellerActions();

  const [detailShop, setDetailShop] = useState<AdminShopRecord | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusChange, setStatusChange] = useState<{
    shop: AdminShopRecord;
    nextStatus: ShopStatus;
  } | null>(null);

  const handleInspectShop = async (shop: AdminShopRecord) => {
    setDetailShop(shop);
    setLoadingDetail(true);
    try {
      const res = await adminService.getAdminShopDetails(shop.id);
      if (res.data) setDetailShop(res.data);
    } catch {
      // Keep summary record if detail lookup fails
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!statusChange) return;
    try {
      await actions.updateShopStatus.mutateAsync({
        shopId: statusChange.shop.id,
        status: statusChange.nextStatus,
      });
      toast.success(`Shop status updated to ${statusChange.nextStatus}`);
      setStatusChange(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Status update failed.');
    }
  };

  const shops = shopsRes?.data || [];
  const meta = shopsRes?.meta;

  const columns: DataTableColumn<AdminShopRecord>[] = [
    {
      key: 'name',
      header: 'Shop',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl border border-border-slate bg-surface-container-low overflow-hidden shrink-0">
            <SafeImage
              src={row.logo}
              alt={row.name}
              fill
              sizes="40px"
              fallbackIcon={<Store className="w-4 h-4 opacity-40" />}
            />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{row.name}</p>
            <p className="text-xs text-text-muted">{row.city || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Owner Business',
      render: (row) => (
        <span className="text-sm text-on-surface-variant">
          {row.seller?.business_name || row.seller?.user?.name || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => (
        <span className="text-xs text-text-muted tabular-nums">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Governance',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleInspectShop(row)}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          {row.status !== 'ACTIVE' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStatusChange({ shop: row, nextStatus: 'ACTIVE' })}
            >
              Activate
            </Button>
          )}
          {row.status === 'ACTIVE' && (
            <Button
              type="button"
              variant="destructive-outline"
              size="sm"
              onClick={() => setStatusChange({ shop: row, nextStatus: 'SUSPENDED' })}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Suspend</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Merchant Shops Directory
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Inspect storefront profiles and govern marketplace visibility.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search shop name..."
          className="sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ShopStatus | '');
            setPage(1);
          }}
          aria-label="Filter shops by status"
          className="h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      <DataTable
        data={shops}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        emptyTitle="No shops registered yet"
        emptyDescription="Approved sellers automatically provision storefronts listed here."
        page={meta?.page || page}
        totalPages={meta?.totalPages || 1}
        totalItems={meta?.total}
        onPageChange={setPage}
      />

      {detailShop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-3)] space-y-4">
            <div className="flex items-center justify-between border-b border-border-slate pb-3">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display font-bold text-lg text-on-surface">{detailShop.name}</h2>
                <StatusBadge status={detailShop.status} />
              </div>
              <button
                type="button"
                onClick={() => setDetailShop(null)}
                className="p-1 text-text-muted hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="h-24 rounded-xl bg-surface-container-low animate-pulse" />
            ) : (
              <div className="space-y-2.5 text-sm">
                <p className="text-on-surface-variant">{detailShop.description || 'No description provided.'}</p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-text-muted">City</span>
                    <p className="font-semibold text-on-surface">{detailShop.city || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Contact Email</span>
                    <p className="font-semibold text-on-surface">{detailShop.contact_email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Contact Phone</span>
                    <p className="font-semibold text-on-surface">{detailShop.contact_phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Category</span>
                    <p className="font-semibold text-on-surface">{detailShop.category_name || detailShop.category || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDetailShop(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(statusChange)}
        onOpenChange={(open) => {
          if (!open) setStatusChange(null);
        }}
        title={`Change Shop Status to ${statusChange?.nextStatus || ''}?`}
        description={`Updating "${statusChange?.shop.name || ''}" immediately updates its storefront visibility.`}
        confirmLabel="Confirm Status Change"
        variant={statusChange?.nextStatus === 'ACTIVE' ? 'default' : 'destructive'}
        isLoading={actions.updateShopStatus.isPending}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
}
