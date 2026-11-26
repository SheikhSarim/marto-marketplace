'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Store, MapPin, ShieldCheck } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { ErrorState } from '@/components/ui/ErrorState';
import { SafeImage } from '@/components/ui/SafeImage';
import { CardSkeleton } from '@/components/ui/Skeletons';
import { shopService } from '@/services/shop.service';
import { isApiNotAvailableError } from '@/lib/api/errors';

export default function ShopsDirectoryPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['publicShopsDirectory'],
    queryFn: () => shopService.getPublicShops(),
  });

  const shops = data?.data || [];

  return (
    <StorefrontShell>
      <div className="marto-container py-8 sm:py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
            Verified Merchant Directory
          </h1>
          <p className="text-sm text-text-muted">
            Browse independent Pakistani storefronts vetted and approved by Marto.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          isApiNotAvailableError(error) ? (
            <FeatureUnavailable
              title="Public Shop Directory Service Pending"
              description={error.message}
              endpointHint={`${error.method} ${error.path}`}
              backHref="/products"
              backLabel="Browse Catalog Instead"
            />
          ) : (
            <ErrorState
              message={error instanceof Error ? error.message : 'Unable to load verified shops.'}
              onRetry={() => refetch()}
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${encodeURIComponent(shop.id)}`}
                className="rounded-2xl border border-border-slate bg-surface-card p-5 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-all flex items-start gap-4"
              >
                <div className="relative w-14 h-14 rounded-2xl border border-border-slate bg-surface-container-low overflow-hidden shrink-0">
                  <SafeImage
                    src={shop.logo}
                    alt={shop.name}
                    fill
                    sizes="56px"
                    fallbackIcon={<Store className="w-6 h-6 opacity-40" />}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display font-semibold text-base text-on-surface truncate">
                      {shop.name}
                    </h2>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  {shop.city && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{shop.city}</span>
                    </p>
                  )}
                  <p className="text-xs text-text-muted line-clamp-2">{shop.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
