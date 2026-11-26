'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, History, Trash2 } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { usePublicProducts } from '@/hooks/queries/useMarketplaceQueries';
import { CLIENT_STORAGE_KEYS, safeGetStorage, safeSetStorage, safeRemoveStorage } from '@/lib/storage';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setQueryInput(initialQuery);
    setRecentSearches(safeGetStorage<string[]>(CLIENT_STORAGE_KEYS.RECENT_SEARCHES, []));
  }, [initialQuery]);

  const { data: productsRes, isLoading, error, refetch } = usePublicProducts({
    status: 'ACTIVE',
    search: initialQuery.trim() || undefined,
    limit: 24,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentSearches.filter((r) => r.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setRecentSearches(next);
    safeSetStorage(CLIENT_STORAGE_KEYS.RECENT_SEARCHES, next);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const clearHistory = () => {
    safeRemoveStorage(CLIENT_STORAGE_KEYS.RECENT_SEARCHES);
    setRecentSearches([]);
  };

  const products = productsRes?.data || [];

  return (
    <div className="marto-container py-8 sm:py-10 space-y-6">
      <div className="max-w-2xl space-y-4">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
          Search Marketplace
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search laptops, craft textiles, electronics..."
              className="w-full h-11 pl-10 pr-4 rounded-full border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-6 rounded-full bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
              <History className="w-3.5 h-3.5" />
              Recent:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                className="px-3 py-1 rounded-full bg-surface-card border border-border-slate text-xs font-medium text-on-surface hover:border-primary cursor-pointer"
              >
                {term}
              </button>
            ))}
            <button
              type="button"
              onClick={clearHistory}
              aria-label="Clear search history"
              className="p-1 text-text-subtle hover:text-status-danger cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {initialQuery && (
        <p className="text-sm text-text-muted">
          Showing results for <strong className="text-on-surface">&ldquo;{initialQuery}&rdquo;</strong>
        </p>
      )}

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <ErrorState
          message={error instanceof Error ? error.message : 'Unable to execute search.'}
          onRetry={() => refetch()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No matching listings"
          description="No products matched your search query. Try another keyword."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <StorefrontShell>
      <Suspense
        fallback={
          <div className="marto-container py-10">
            <ProductGridSkeleton count={8} />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </StorefrontShell>
  );
}
