'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { usePublicCategories, usePublicProducts } from '@/hooks/queries/useMarketplaceQueries';
import { ProductAvailability } from '@/types';
import { ProductFilterParams } from '@/services/product.service';

export default function ProductsCatalogPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [availability, setAvailability] = useState<ProductAvailability | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<NonNullable<ProductFilterParams['sortBy']>>('product.created_at');
  const [page, setPage] = useState(1);

  const { data: categoriesRes } = usePublicCategories();
  const categories = (categoriesRes?.data || []).filter((c) => c.status === 'ACTIVE');

  const filters: ProductFilterParams = {
    status: 'ACTIVE',
    page,
    limit: 16,
    sortBy,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(categoryId ? { primary_category_id: categoryId } : {}),
    ...(availability ? { availability } : {}),
    ...(minPrice !== '' && !Number.isNaN(Number(minPrice)) ? { minPrice: Number(minPrice) } : {}),
    ...(maxPrice !== '' && !Number.isNaN(Number(maxPrice)) ? { maxPrice: Number(maxPrice) } : {}),
  };

  const { data: productsRes, isLoading, error, refetch } = usePublicProducts(filters);
  const products = productsRes?.data || [];
  const meta = productsRes?.meta;
  const totalPages = meta?.totalPages || 1;

  const resetFilters = () => {
    setSearch('');
    setCategoryId('');
    setAvailability('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('product.created_at');
    setPage(1);
  };

  const hasFilters = Boolean(search || categoryId || availability || minPrice || maxPrice);

  return (
    <StorefrontShell>
      <div className="marto-container py-8 sm:py-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
              Marketplace Catalog
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Discover verified products across active Marto merchant storefronts.
            </p>
          </div>
          {typeof meta?.total === 'number' && (
            <span className="text-xs font-semibold text-text-muted tabular-nums">
              {meta.total} {meta.total === 1 ? 'listing' : 'listings'} found
            </span>
          )}
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-border-slate bg-surface-card p-4 shadow-[var(--shadow-level-1)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by product name or brand..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface focus:outline-none focus:border-primary-container"
              />
            </div>

            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="h-10 px-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value as ProductAvailability | '');
                setPage(1);
              }}
              aria-label="Filter by stock availability"
              className="h-10 px-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="">Any Stock</option>
              <option value="IN_STOCK">In Stock Only</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="Min PKR"
                className="h-10 px-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface tabular-nums focus:outline-none focus:border-primary-container"
              />
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="Max PKR"
                className="h-10 px-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface tabular-nums focus:outline-none focus:border-primary-container"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as NonNullable<ProductFilterParams['sortBy']>);
                setPage(1);
              }}
              aria-label="Sort products"
              className="h-10 px-3 rounded-lg border border-border-slate bg-surface-page text-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="product.created_at">Newest First</option>
              <option value="product.final_price">Price</option>
              <option value="product.name">Name (A–Z)</option>
              <option value="product.sold_count">Popularity</option>
              <option value="product.rating_avg">Rating</option>
            </select>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between pt-1 border-t border-border-slate/70">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Active filters applied</span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear all filters</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState
            message={error instanceof Error ? error.message : 'Unable to load catalog.'}
            onRetry={() => refetch()}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Try clearing your price range or category filters to explore other listings."
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
                <span className="text-xs font-semibold text-text-muted tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </StorefrontShell>
  );
}
