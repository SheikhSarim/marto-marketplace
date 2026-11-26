'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, isLoading, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-card border border-border-slate shadow-[var(--shadow-level-3)] overflow-hidden">
        <div className="p-5 border-b border-border-slate flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              variant === 'destructive'
                ? 'bg-rose-50 text-status-danger border border-rose-200'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-display font-semibold text-on-surface">
              {title}
            </h3>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              {description}
            </p>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children && <div className="px-5 py-4 bg-surface-page/50">{children}</div>}

        <div className="p-4 bg-surface-page border-t border-border-slate flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
