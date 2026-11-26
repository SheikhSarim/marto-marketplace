'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-page text-on-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl bg-surface-card border border-border-slate p-8 text-center shadow-[var(--shadow-level-2)]">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-status-danger flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="font-display text-xl font-bold text-on-surface">
          Something went wrong
        </h1>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          {error.message || 'An unexpected error occurred while rendering this view.'}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button type="button" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Marketplace Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
