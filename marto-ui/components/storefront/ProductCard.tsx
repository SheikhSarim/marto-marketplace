'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '@/types';
import { useCart } from '@/providers/CartContext';
import { SafeImage } from '@/components/ui/SafeImage';
import { PriceTag } from '@/components/ui/PriceTag';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0 || product.status === 'OUT_OF_STOCK';
  const compareAt =
    product.finalPrice < product.price && product.price > 0 ? product.price : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const added = addToCart(
      product,
      {
        id: product.shopId || 'shop',
        name: product.shopName || 'Marto Merchant',
        city: product.shopCity,
      },
      1
    );
    if (added) {
      toast.success('Added to cart', {
        description: `${product.name} added to your bag.`,
      });
    }
  };

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      className="group flex flex-col rounded-2xl border border-border-slate bg-surface-card shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] hover:border-border-slate-strong transition-all duration-200 overflow-hidden"
    >
      {/* 1:1 Image Frame */}
      <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden">
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap gap-1.5">
            {compareAt && product.discount > 0 && (
              <Badge variant="amber" size="sm" className="shadow-xs">
                -{product.discount}%
              </Badge>
            )}
            {product.is_prepaid_only && (
              <Badge variant="info" size="sm" className="shadow-xs">
                Prepaid
              </Badge>
            )}
          </div>
          {isOutOfStock && (
            <Badge variant="danger" size="sm" className="shadow-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Vendor Attribution */}
        <div className="flex items-center justify-between gap-2 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1 font-medium text-on-surface-variant truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{product.shopName || 'Verified Shop'}</span>
          </span>
          {product.shopCity && (
            <span className="inline-flex items-center gap-0.5 shrink-0 text-[11px] text-text-subtle">
              <MapPin className="w-3 h-3" />
              {product.shopCity}
            </span>
          )}
        </div>

        {/* Title (2-line clamp) */}
        <h3 className="font-display font-semibold text-[15px] leading-snug text-on-surface line-clamp-2 min-h-[2.625rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Optional rating if returned by API */}
        {typeof product.rating === 'number' && product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-muted tabular-nums">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-on-surface">{product.rating.toFixed(1)}</span>
            {typeof product.reviewsCount === 'number' && product.reviewsCount > 0 && (
              <span>({product.reviewsCount})</span>
            )}
          </div>
        )}

        {/* Price + Action */}
        <div className="mt-auto pt-2 border-t border-border-slate/70 flex items-center justify-between gap-2">
          <PriceTag price={product.finalPrice} compareAtPrice={compareAt} size="sm" />
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-primary-container text-on-surface hover:text-on-primary border border-border-slate hover:border-primary-container flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
