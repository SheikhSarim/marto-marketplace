'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Store, ShieldCheck, MapPin } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { SafeImage } from '@/components/ui/SafeImage';
import { usePublicProducts, usePublicShopCollections } from '@/hooks/queries/useMarketplaceQueries';
import { shopService } from '@/services/shop.service';
import { isApiNotAvailableError } from '@/lib/api/errors';

export default function ShopStorefrontPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params?.shopId ? decodeURIComponent(params.shopId) : '';
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  const { data: shopRes } = useQuery({
    queryKey: ['publicShopDetail', shopId],
    queryFn: async () => {
      try {
        return await shopService.getPublicShopById(shopId);
      } catch (err) {
        if (isApiNotAvailableError(err)) return null;
        throw err;
      }
    },
    enabled: Boolean(shopId),
  });

  const { data: collectionsRes } = usePublicShopCollections(shopId);
  const { data: productsRes, isLoading: productsLoading } = usePublicProducts({
    shopId,
    status: 'ACTIVE',
    ...(selectedCollectionId ? { shop_category_id: selectedCollectionId } : {}),
  });

  const shop = shopRes?.data;
  const collections = (collectionsRes?.data || []).filter((c) => c.status === 'ACTIVE');
  const products = productsRes?.data || [];
  const inferredShopName = shop?.name || products[0]?.shopName || 'Merchant Storefront';
  const inferredCity = shop?.city || products[0]?.shopCity;

  return (
    <StorefrontShell>
      <div className="marto-container py-8 sm:py-10 space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Shop Banner Card */}
        <div className="rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-1)] flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative w-18 h-18 rounded-2xl border border-border-slate bg-surface-container-low overflow-hidden shrink-0">
            <SafeImage
              src={shop?.logo}
              alt={inferredShopName}
              fill
              sizes="72px"
              fallbackIcon={<Store className="w-7 h-7 opacity-40" />}
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                {inferredShopName}
              </h1>
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            </div>
            {inferredCity && (
              <p className="text-sm text-text-muted inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Dispatches from {inferredCity}</span>
              </p>
            )}
            {shop?.description && (
              <p className="text-sm text-on-surface-variant max-w-2xl">
                {shop.description}
              </p>
            )}
          </div>
        </div>

        {/* Shop Collections Tabs */}
        {collections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCollectionId('')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                selectedCollectionId === ''
                  ? 'bg-primary-container text-on-primary border-primary-container'
                  : 'bg-surface-card text-on-surface border-border-slate hover:border-primary'
              }`}
            >
              All Items
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedCollectionId === col.id
                    ? 'bg-primary-container text-on-primary border-primary-container'
                    : 'bg-surface-card text-on-surface border-border-slate hover:border-primary'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No active products in this storefront"
            description="Check back soon or browse other Marto merchants."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
