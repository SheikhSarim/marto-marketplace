import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-slate bg-surface-card p-10 text-center flex flex-col items-center justify-center shadow-[var(--shadow-level-1)]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-container-low border border-border-slate text-text-muted flex items-center justify-center mb-4">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="font-display font-semibold text-base text-on-surface">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-md mt-1.5 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
