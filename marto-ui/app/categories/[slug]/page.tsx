'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Tag } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/button';
import { usePublicCategories, usePublicProducts } from '@/hooks/queries/useMarketplaceQueries';

export default function CategoryBrowsePage() {
  const params = useParams<{ slug: string }>();
  const slugOrId = params?.slug ? decodeURIComponent(params.slug) : '';

  const { data: categoriesRes, isLoading: catsLoading } = usePublicCategories();
  const category = useMemo(() => {
    const list = categoriesRes?.data || [];
    return list.find((c) => c.id === slugOrId || c.slug === slugOrId);
  }, [categoriesRes?.data, slugOrId]);

  const targetCategoryId = category?.id || slugOrId;
  const {
    data: productsRes,
    isLoading: productsLoading,
    error,
    refetch,
  } = usePublicProducts({
    status: 'ACTIVE',
    primary_category_id: targetCategoryId,
  });

  const products = productsRes?.data || [];

  return (
    <StorefrontShell>
      <div className="marto-container py-8 sm:py-10 space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Products</span>
        </Link>

        <div className="rounded-2xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-1)] flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
              {catsLoading ? 'Loading Category...' : category?.name || 'Category Catalog'}
            </h1>
            {category?.description && (
              <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <ErrorState
            message={error instanceof Error ? error.message : 'Unable to load category listings.'}
            onRetry={() => refetch()}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="No listings in this category yet"
            description="Merchants haven't assigned active products to this category yet."
            action={
              <Link href="/products">
                <Button variant="outline" size="sm">
                  Browse All Products
                </Button>
              </Link>
            }
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
