'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Store, LayoutGrid, Clock, ArrowRight } from 'lucide-react';
import {
  useAdminSellers,
  useAdminShops,
  useAdminCategories,
} from '@/hooks/queries/useMarketplaceQueries';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function SuperAdminDashboard() {
  const { data: sellersAll } = useAdminSellers({ limit: 1 });
  const { data: sellersPending } = useAdminSellers({ limit: 1, status: 'PENDING' });
  const { data: shopsAll } = useAdminShops({ limit: 1 });
  const { data: catsAll } = useAdminCategories();

  const totalSellers = sellersAll?.meta?.total ?? sellersAll?.data?.length ?? 0;
  const pendingSellers = sellersPending?.meta?.total ?? sellersPending?.data?.length ?? 0;
  const totalShops = shopsAll?.meta?.total ?? shopsAll?.data?.length ?? 0;
  const totalCategories = catsAll?.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
            Marketplace Governance Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Live counts retrieved from paginated governance endpoints.
          </p>
        </div>
        <Link
          href="/admin/sellers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors"
        >
          <span>Review Seller Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Live Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          href="/admin/sellers"
          className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:border-primary/40 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Registered Sellers</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-2xl text-on-surface tabular-nums">
            {totalSellers}
          </p>
        </Link>

        <Link
          href="/admin/sellers"
          className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-[var(--shadow-level-1)] hover:border-amber-400 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-accent-amber" />
          </div>
          <p className="font-display font-bold text-2xl text-amber-900 tabular-nums">
            {pendingSellers}
          </p>
        </Link>

        <Link
          href="/admin/shops"
          className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:border-primary/40 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Merchant Shops</span>
            <Store className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-2xl text-on-surface tabular-nums">
            {totalShops}
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:border-primary/40 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Platform Categories</span>
            <LayoutGrid className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-2xl text-on-surface tabular-nums">
            {totalCategories}
          </p>
        </Link>
      </div>

      {/* Unshipped GMV & Order Analytics */}
      <FeatureUnavailable
        title="Platform GMV, Order Metrics & Activity Stream Pending"
        description="Global gross merchandise volume, statutory fee revenue, and cross-tenant order analytics will appear here once the backend metrics endpoint ships."
        endpointHint="GET /api/v1/admin/metrics"
      />
    </div>
  );
}
