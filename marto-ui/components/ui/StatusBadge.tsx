import React from 'react';
import { SellerStatus, ShopStatus, ProductStatus, CategoryStatus, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

type AnyStatus = SellerStatus | ShopStatus | ProductStatus | CategoryStatus | OrderStatus | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';

  const s = String(status || '').toUpperCase();

  switch (s) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'DELIVERED':
    case 'PAID':
    case 'VERIFIED':
    case 'IN_STOCK':
      colorStyles = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25';
      dotColor = 'bg-status-success';
      break;
    case 'PENDING':
    case 'AWAITING_PAYMENT':
    case 'ON_HOLD':
      colorStyles = 'bg-amber-500/12 text-amber-800 border-amber-500/25';
      dotColor = 'bg-accent-amber';
      break;
    case 'CONFIRMED':
    case 'READY_FOR_PICKUP':
      colorStyles = 'bg-blue-500/12 text-blue-700 border-blue-500/25';
      dotColor = 'bg-status-info';
      break;
    case 'PROCESSING':
      colorStyles = 'bg-indigo-500/12 text-indigo-700 border-indigo-500/25';
      dotColor = 'bg-status-processing';
      break;
    case 'SHIPPED':
      colorStyles = 'bg-purple-500/12 text-purple-700 border-purple-500/25';
      dotColor = 'bg-status-shipped';
      break;
    case 'DISABLED':
    case 'REJECTED':
    case 'CANCELLED':
    case 'REMOVED':
    case 'FAILED':
    case 'REFUNDED':
      colorStyles = 'bg-rose-500/12 text-rose-700 border-rose-500/25';
      dotColor = 'bg-status-danger';
      break;
    case 'INACTIVE':
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';
      dotColor = 'bg-slate-500';
      break;
    case 'SUSPENDED':
    case 'OUT_OF_STOCK':
    case 'LOW_STOCK':
      colorStyles = 'bg-orange-500/12 text-orange-700 border-orange-500/25';
      dotColor = 'bg-status-warning';
      break;
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide',
        colorStyles,
        sizeClasses,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
      <span>{s.replace(/_/g, ' ')}</span>
    </span>
  );
}
