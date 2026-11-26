import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  badge,
  icon,
  backHref = '/',
  backLabel = 'Back to Marketplace',
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-surface-page text-on-surface flex flex-col">
      <header className="glass-header sticky top-0 z-20">
        <div className="marto-container h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display font-bold text-lg text-on-surface tracking-tight"
          >
            <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span>Marto</span>
          </Link>

          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-6 space-y-2">
            {icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
                {icon}
              </div>
            )}
            {badge && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-low text-primary border border-border-slate">
                {badge}
              </span>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-text-muted leading-relaxed">{subtitle}</p>
          </div>

          <div className="rounded-3xl bg-surface-card border border-border-slate p-6 sm:p-8 shadow-[var(--shadow-level-2)]">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-sm text-text-muted">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
