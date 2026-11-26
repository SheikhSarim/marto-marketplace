import React from 'react';
import { ServerOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeatureUnavailableProps {
  title?: string;
  description?: string;
  endpointHint?: string;
  compact?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function FeatureUnavailable({
  title = 'Service Pending Backend Rollout',
  description = 'This section goes live automatically when the backend service endpoint is enabled in the API contract.',
  endpointHint,
  compact = false,
  backHref,
  backLabel = 'Return',
  className,
}: FeatureUnavailableProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-slate bg-surface-card shadow-[var(--shadow-level-1)] text-center flex flex-col items-center justify-center',
        compact ? 'p-6' : 'p-10 sm:p-14',
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'rounded-2xl bg-surface-container-low border border-border-slate text-primary flex items-center justify-center mb-4',
          compact ? 'w-11 h-11' : 'w-14 h-14'
        )}
      >
        <ServerOff className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
      </div>
      <h3
        className={cn(
          'font-display font-semibold text-on-surface',
          compact ? 'text-base' : 'text-xl'
        )}
      >
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-md mt-2 leading-relaxed">
        {description}
      </p>
      {endpointHint && (
        <code className="mt-4 px-3 py-1 rounded-full bg-surface-page border border-border-slate text-xs font-mono text-text-muted">
          {endpointHint}
        </code>
      )}
      {backHref && (
        <Link
          href={backHref}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-slate bg-surface-page hover:bg-surface-container-low text-sm font-semibold text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>
      )}
    </div>
  );
}
