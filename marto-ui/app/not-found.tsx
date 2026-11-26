import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-page text-on-surface flex flex-col items-center justify-center p-6 text-center">
      <span className="px-3.5 py-1 rounded-full bg-surface-container-low border border-border-slate text-xs font-semibold text-primary mb-4">
        404 · Page Not Found
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-on-surface mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-sm text-text-muted max-w-md mb-8 leading-relaxed">
        The product, shop, or route you requested may have been moved or is no longer active.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary font-semibold text-sm transition-colors shadow-[var(--shadow-level-1)]"
        >
          <Home className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-card hover:bg-surface-container-low text-on-surface border border-border-slate text-sm font-semibold transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Browse Products</span>
        </Link>
      </div>
    </div>
  );
}
