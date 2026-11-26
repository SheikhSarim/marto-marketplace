'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Sparkles,
  Tag,
} from 'lucide-react';
import heroCraftImg from '@/src/assets/images/marto_hero_craft_1795277623436.jpg';
import vendorShowcaseImg from '@/src/assets/images/marto_vendor_showcase_1795277622518.jpg';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/SafeImage';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { usePublicCategories, usePublicProducts } from '@/hooks/queries/useMarketplaceQueries';
import { isApiNotAvailableError } from '@/lib/api/errors';

export default function HomePage() {
  const {
    data: productsRes,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = usePublicProducts({ limit: 8, status: 'ACTIVE', sortBy: 'product.created_at' });

  const {
    data: categoriesRes,
    isLoading: categoriesLoading,
  } = usePublicCategories();

  const products = productsRes?.data || [];
  const categories = (categoriesRes?.data || []).filter((c) => c.status === 'ACTIVE').slice(0, 10);

  return (
    <StorefrontShell>
      {/* 1. Editorial Hero */}
      <section className="relative overflow-hidden border-b border-border-slate bg-surface-card">
        <div className="marto-container py-10 sm:py-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Multi-Vendor Commerce · Pakistan</span>
            </span>

            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-on-surface leading-[1.12] tracking-[-0.02em]">
              Curated local shops.{' '}
              <span className="text-primary">Delivered direct</span> from merchant to doorstep.
            </h1>

            <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
              Shop directly from approved Pakistani storefronts with transparent PKR pricing and dedicated single-seller fulfillment on every order.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/products">
                <Button variant="pill" size="lg">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" size="lg" className="rounded-full">
                  <Store className="w-4 h-4 text-primary" />
                  <span>Open Your Shop</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-border-slate shadow-[var(--shadow-level-2)] bg-surface-container-low">
              <SafeImage
                src={heroCraftImg}
                alt="Curated crafts and modern lifestyle products from Marto merchants"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Discovery Strip */}
      <section className="marto-container pt-10 pb-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-on-surface">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>All products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-32 rounded-full bg-surface-container-low border border-border-slate animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-text-muted">
            Categories will appear here once published by platform administrators.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${encodeURIComponent(cat.slug || cat.id)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-slate bg-surface-card hover:border-primary hover:bg-primary/5 text-sm font-medium text-on-surface transition-colors shadow-[var(--shadow-level-1)]"
              >
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Live Marketplace Catalog */}
      <section className="marto-container py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh From Approved Merchants</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-on-surface">
              Latest Marketplace Listings
            </h2>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm" className="rounded-full">
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : productsError ? (
          isApiNotAvailableError(productsError) ? (
            <FeatureUnavailable
              title="Catalog Service Pending"
              description={productsError.message}
              endpointHint={`${productsError.method} ${productsError.path}`}
            />
          ) : (
            <ErrorState
              message={
                productsError instanceof Error
                  ? productsError.message
                  : 'Unable to fetch catalog products.'
              }
              onRetry={() => refetchProducts()}
            />
          )
        ) : products.length === 0 ? (
          <EmptyState
            title="No active products listed yet"
            description="Verified merchants have not published active listings yet. Check back soon or apply to launch the first storefront."
            action={
              <Link href="/sell/register">
                <Button variant="pill" size="sm">
                  Become a Marto Merchant
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
      </section>

      {/* 4. Merchant Onboarding Feature */}
      <section className="marto-container pb-14 pt-4">
        <div className="rounded-3xl border border-border-slate bg-surface-midnight text-on-primary overflow-hidden shadow-[var(--shadow-level-2)] grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-teal-200">
              <Store className="w-3.5 h-3.5" />
              <span>Marto Merchant Program</span>
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
              Launch your verified digital shop in minutes
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Manage your own storefront collections, product inventory, sale pricing schedules, and transparent order fulfillment from one unified seller console.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/sell/register">
                <Button variant="pill" size="lg">
                  <span>Apply as Seller</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sell/application-status">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full bg-transparent border-white/25 text-white hover:bg-white/10"
                >
                  Check Application Status
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/3] w-full h-full min-h-[240px]">
            <SafeImage
              src={vendorShowcaseImg}
              alt="Pakistani independent business preparing orders for dispatch"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
