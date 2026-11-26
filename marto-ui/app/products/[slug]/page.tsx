'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Store,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { SafeImage } from '@/components/ui/SafeImage';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { usePublicProduct } from '@/hooks/queries/useMarketplaceQueries';
import { useCart } from '@/providers/CartContext';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const productId = params?.slug ? decodeURIComponent(params.slug) : '';
  const { data: productRes, isLoading, error, refetch } = usePublicProduct(productId);
  const { addToCart } = useCart();

  const product = productRes?.data;
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = useMemo(() => product?.images || [], [product?.images]);
  const activeImage = images[selectedImageIdx] || images[0];

  const handleAddToCart = () => {
    if (!product) return;
    const added = addToCart(
      product,
      {
        id: product.shopId || 'shop',
        name: product.shopName || 'Verified Shop',
        city: product.shopCity,
      },
      quantity
    );
    if (added) {
      toast.success('Added to bag', {
        description: `${quantity} × ${product.name}`,
      });
    }
  };

  return (
    <StorefrontShell>
      <div className="marto-container py-8 space-y-10">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-6 aspect-square rounded-3xl bg-surface-container-low border border-border-slate" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-5 w-1/3 rounded bg-surface-container-low" />
              <div className="h-9 w-3/4 rounded bg-surface-container" />
              <div className="h-8 w-1/2 rounded bg-surface-container-low" />
              <div className="h-32 w-full rounded-2xl bg-surface-container-low" />
            </div>
          </div>
        ) : error || !product ? (
          <ErrorState
            title="Product not found"
            message={
              error instanceof Error
                ? error.message
                : 'This product listing could not be loaded.'
            }
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Gallery */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative aspect-square w-full rounded-3xl border border-border-slate bg-surface-card overflow-hidden shadow-[var(--shadow-level-1)]">
                  <SafeImage
                    src={activeImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}_${idx}`}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`relative w-18 h-18 rounded-xl border overflow-hidden shrink-0 cursor-pointer transition-all ${
                          idx === selectedImageIdx
                            ? 'border-primary ring-2 ring-primary/25'
                            : 'border-border-slate opacity-80 hover:opacity-100'
                        }`}
                      >
                        <SafeImage src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} fill sizes="72px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Panel */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {product.primaryCategoryName && (
                      <Badge variant="default" size="sm">
                        {product.primaryCategoryName}
                      </Badge>
                    )}
                    {product.brand && (
                      <Badge variant="outline" size="sm">
                        {product.brand}
                      </Badge>
                    )}
                    {product.is_prepaid_only && (
                      <Badge variant="info" size="sm">
                        Prepaid Only
                      </Badge>
                    )}
                  </div>

                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface leading-tight">
                    {product.name}
                  </h1>

                  <PriceTag
                    price={product.finalPrice}
                    compareAtPrice={
                      product.finalPrice < product.price && product.price > 0
                        ? product.price
                        : null
                    }
                    size="display"
                  />
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-sm">
                  {product.stock > 0 && product.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-status-success">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>In Stock ({product.stock} available)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-status-danger">
                      <AlertCircle className="w-4 h-4" />
                      <span>Currently Out of Stock</span>
                    </span>
                  )}
                </div>

                {/* Quantity & Add to Cart */}
                <div className="rounded-2xl border border-border-slate bg-surface-card p-5 space-y-4 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-on-surface">Quantity</span>
                    <div className="inline-flex items-center rounded-xl border border-border-slate bg-surface-page">
                      <button
                        type="button"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="p-2.5 text-text-muted hover:text-on-surface disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-bold tabular-nums text-on-surface">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        disabled={product.stock > 0 && quantity >= product.stock}
                        onClick={() =>
                          setQuantity((q) =>
                            product.stock > 0 ? Math.min(product.stock, q + 1) : q + 1
                          )
                        }
                        aria-label="Increase quantity"
                        className="p-2.5 text-text-muted hover:text-on-surface disabled:opacity-40 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="pill"
                    size="lg"
                    disabled={product.stock <= 0 || product.status !== 'ACTIVE'}
                    onClick={handleAddToCart}
                    className="w-full"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </Button>
                </div>

                {/* Merchant Card */}
                <div className="rounded-2xl border border-border-slate bg-surface-card p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-semibold text-base text-on-surface truncate">
                          {product.shopName || 'Verified Shop'}
                        </span>
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      </div>
                      <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {product.shopCity
                            ? `Dispatches from ${product.shopCity}`
                            : 'Single-seller direct dispatch'}
                        </span>
                      </p>
                    </div>
                  </div>
                  {product.shopId && (
                    <Link href={`/shops/${encodeURIComponent(product.shopId)}`}>
                      <Button variant="outline" size="sm" className="rounded-full">
                        Visit Shop
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="space-y-2 pt-2">
                    <h2 className="font-display font-semibold text-base text-on-surface">
                      Product Specifications
                    </h2>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Reviews Section */}
            <section className="pt-6 border-t border-border-slate">
              <h2 className="font-display font-bold text-xl text-on-surface mb-4">
                Customer Reviews
              </h2>
              <FeatureUnavailable
                compact
                title="Customer Reviews Service Pending"
                description="Verified customer review submissions and ratings will display automatically once the backend review endpoint is published."
                endpointHint="GET /api/v1/products/:id/reviews"
              />
            </section>
          </>
        )}
      </div>
    </StorefrontShell>
  );
}
