import React from 'react';
import { formatPKR } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  compareAtPrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'display';
  className?: string;
}

export function PriceTag({
  price,
  compareAtPrice,
  size = 'md',
  className,
}: PriceTagProps) {
  const hasDiscount =
    typeof compareAtPrice === 'number' &&
    Number.isFinite(compareAtPrice) &&
    compareAtPrice > price;

  const discountPct = hasDiscount
    ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)
    : 0;

  const sizeMap = {
    sm: 'text-sm font-bold',
    md: 'text-[18px] leading-6 font-bold tracking-[-0.01em]',
    lg: 'text-2xl font-bold tracking-tight',
    display: 'text-[28px] leading-8 font-bold tracking-[-0.02em]',
  };

  return (
    <div className={cn('inline-flex flex-wrap items-baseline gap-2 tabular-nums', className)}>
      <span className={cn('text-on-surface', sizeMap[size])}>
        {formatPKR(price)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-text-muted line-through font-normal">
            {formatPKR(compareAtPrice)}
          </span>
          {discountPct > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-800 border border-amber-500/25">
              -{discountPct}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
