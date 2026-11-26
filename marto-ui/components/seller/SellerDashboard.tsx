'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Package, LayoutGrid, ArrowRight } from 'lucide-react';
import {
  useMyShop,
  useSellerProducts,
  useSellerCollections,
} from '@/hooks/queries/useMarketplaceQueries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { Button } from '@/components/ui/button';

export function SellerDashboard() {
  const { data: shopRes, isLoading: shopLoading } = useMyShop();
  const shop = shopRes?.data;
  const { data: productsRes } = useSellerProducts(shop?.id, { limit: 1 });
  const { data: collectionsRes } = useSellerCollections(shop?.id, { limit: 1 });

  const totalProducts = productsRes?.meta?.total ?? productsRes?.data?.length ?? 0;
  const totalCollections = collectionsRes?.meta?.total ?? collectionsRes?.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
            Seller Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Live metrics from your verified storefront and catalog services.
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button variant="pill" size="sm">
            <span>Add New Product</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Real API Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Storefront Status</span>
            <Store className="w-4 h-4 text-primary" />
          </div>
          {shopLoading ? (
            <div className="h-7 w-28 rounded bg-surface-container-low animate-pulse" />
          ) : (
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-display font-bold text-lg text-on-surface truncate">
                {shop?.name || 'My Shop'}
              </span>
              {shop?.status && <StatusBadge status={shop.status} />}
            </div>
          )}
        </div>

        <Link
          href="/seller/products"
          className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:border-primary/40 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Catalog Products</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-2xl text-on-surface tabular-nums">
            {totalProducts}
          </p>
        </Link>

        <Link
          href="/seller/categories"
          className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:border-primary/40 transition-colors space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted">
            <span>Store Collections</span>
            <LayoutGrid className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-2xl text-on-surface tabular-nums">
            {totalCollections}
          </p>
        </Link>
      </div>

      {/* Unshipped Orders & Revenue Feeds */}
      <FeatureUnavailable
        title="Orders & Payout Analytics Endpoints Pending"
        description="Real-time order volume, settlement breakdowns, and payout ledger metrics will activate automatically once the Seller Orders & Revenue APIs are published."
        endpointHint="GET /api/v1/seller/orders · GET /api/v1/seller/revenue"
      />
    </div>
  );
}
