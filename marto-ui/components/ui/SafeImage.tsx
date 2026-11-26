'use client';

import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SafeImageProps {
  src?: string | StaticImageData | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  className,
  containerClassName,
  fallbackIcon,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const isEmpty =
    !src ||
    (typeof src === 'string' && src.trim() === '') ||
    hasError;

  if (isEmpty) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-surface-container-low text-outline select-none',
          fill ? 'absolute inset-0 w-full h-full' : 'w-full h-full',
          containerClassName,
          className
        )}
        role="img"
        aria-label={alt || 'Placeholder image'}
      >
        {fallbackIcon || <Package className="w-8 h-8 opacity-40" />}
      </div>
    );
  }

  // Handle data URLs / blob URLs cleanly (Next Image warns/skips optimization for blob/data)
  const isBlobOrData =
    typeof src === 'string' &&
    (src.startsWith('data:') || src.startsWith('blob:'));

  if (isBlobOrData) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width || 400 : undefined}
        height={!fill ? height || 400 : undefined}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width || 400 : undefined}
      height={!fill ? height || 400 : undefined}
      sizes={fill ? sizes : undefined}
      priority={priority}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={cn('object-cover', className)}
    />
  );
}
