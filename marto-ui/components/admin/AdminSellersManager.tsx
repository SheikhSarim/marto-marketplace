'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminSellers,
  useAdminSellerActions,
} from '@/hooks/queries/useMarketplaceQueries';
import { rejectSellerSchema } from '@/lib/schemas';
import { Seller, SellerStatus } from '@/types';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/format';

type RejectFormValues = z.infer<typeof rejectSellerSchema>;

export function AdminSellersManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const { data: sellersRes, isLoading, error, refetch } = useAdminSellers({
    page,
    limit: 10,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    sortBy: 'seller.created_at',
    sortOrder,
  });

  const actions = useAdminSellerActions();
  const [approveTarget, setApproveTarget] = useState<Seller | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Seller | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSellerSchema),
    defaultValues: { reason: '' },
  });

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    try {
      await actions.approveSeller.mutateAsync(approveTarget.id);
      toast.success('Seller approved');
      setApproveTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed.');
    }
  };

  const onConfirmReject = async (values: RejectFormValues) => {
    if (!rejectTarget) return;
    try {
      await actions.rejectSeller.mutateAsync({
        sellerId: rejectTarget.id,
        reason: values.reason,
      });
      toast.success('Seller application rejected');
      setRejectTarget(null);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed.');
    }
  };

  const sellers = sellersRes?.data || [];
  const meta = sellersRes?.meta;

  const columns: DataTableColumn<Seller>[] = [
    {
      key: 'business_name',
      header: 'Business & Applicant',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-on-surface">
            {row.business_name || row.businessName || row.user?.name || 'Unnamed Seller'}
          </p>
          <p className="text-xs text-text-muted">
            {row.business_email || row.email || row.user?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'city',
      header: 'Location',
      render: (row) => <span className="text-text-muted">{row.city || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          {(row.rejection_reason || row.rejectionReason) && (
            <p className="text-[11px] text-status-danger max-w-[200px] line-clamp-1">
              {row.rejection_reason || row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Applied',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-text-muted tabular-nums">
          {formatDate(row.created_at || row.registeredDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Governance',
      align: 'right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          {row.status !== 'APPROVED' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApproveTarget(row)}
              className="text-status-success border-emerald-200 hover:bg-emerald-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </Button>
          )}
          {row.status !== 'REJECTED' && (
            <Button
              type="button"
              variant="destructive-outline"
              size="sm"
              onClick={() => {
                reset({ reason: '' });
                setRejectTarget(row);
              }}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
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
          Seller Applications & Accounts
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Approve verified merchant onboarding requests or issue documented rejections.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search business name or email..."
          className="sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as SellerStatus | '');
            setPage(1);
          }}
          aria-label="Filter sellers by status"
          className="h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      <DataTable
        data={sellers}
        columns={columns}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        onRetry={() => refetch()}
        emptyTitle="No seller accounts found"
        emptyDescription="Seller applications submitted via /sell/register will appear here."
        page={meta?.page || page}
        totalPages={meta?.totalPages || 1}
        totalItems={meta?.total}
        onPageChange={setPage}
        sortBy="created_at"
        sortOrder={sortOrder}
        onSort={() => setSortOrder((s) => (s === 'DESC' ? 'ASC' : 'DESC'))}
      />

      <ConfirmDialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(null);
        }}
        title="Approve Seller Account?"
        description={`Approving ${
          approveTarget?.business_name || approveTarget?.businessName || 'this seller'
        } activates their storefront and allows console sign-in.`}
        confirmLabel="Approve Seller"
        isLoading={actions.approveSeller.isPending}
        onConfirm={handleConfirmApprove}
      />

      {/* Reject Reason Modal */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-3)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-on-surface">
                Reject Seller Application
              </h2>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="p-1 text-text-muted hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-muted">
              Provide a clear compliance reason for rejecting{' '}
              <strong className="text-on-surface">
                {rejectTarget.business_name || rejectTarget.businessName}
              </strong>
              .
            </p>
            <form onSubmit={handleSubmit(onConfirmReject)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Rejection Reason *</label>
                <textarea
                  {...register('reason')}
                  rows={3}
                  placeholder="Specify missing KYC details or policy violation..."
                  className="w-full rounded-lg border border-border-slate bg-surface-card px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container"
                />
                {errors.reason && (
                  <p className="text-xs text-status-danger">{errors.reason.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Rejection</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
