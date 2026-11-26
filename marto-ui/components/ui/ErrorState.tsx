import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'Something went wrong while communicating with the Marto API.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center flex flex-col items-center justify-center',
        className
      )}
      role="alert"
    >
      <div className="w-11 h-11 rounded-full bg-rose-100 text-status-danger flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-display font-semibold text-base text-on-surface">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mt-1.5">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
