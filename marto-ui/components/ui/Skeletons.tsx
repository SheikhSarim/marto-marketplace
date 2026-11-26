import React from 'react';
import { cn } from '@/lib/utils';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-slate bg-surface-card p-4 space-y-3 animate-pulse',
        className
      )}
    >
      <div className="aspect-square w-full rounded-xl bg-surface-container-low" />
      <div className="h-3 w-1/3 rounded bg-surface-container-low" />
      <div className="h-4 w-5/6 rounded bg-surface-container" />
      <div className="h-5 w-1/2 rounded bg-surface-container-low" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border-slate bg-surface-card overflow-hidden animate-pulse">
      <div className="h-12 bg-surface-page border-b border-border-slate px-4 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-surface-container" />
        ))}
      </div>
      <div className="divide-y divide-border-slate">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 px-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3 flex-1 rounded bg-surface-container-low" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
