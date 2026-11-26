import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Store, Truck, ArrowRight } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <StorefrontShell>
      <div className="marto-container-narrow py-12 sm:py-16 space-y-10">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>About Marto</span>
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface leading-tight">
            Built for trusted multi-vendor commerce in Pakistan
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Marto (marto-online.com) connects verified local businesses with shoppers across Pakistan through transparent PKR pricing, curated product taxonomy, and dedicated single-seller fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border-slate bg-surface-card p-5 space-y-2 shadow-[var(--shadow-level-1)]">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Vetted Storefronts
            </h2>
            <p className="text-sm text-text-muted">
              Every seller undergoes email verification and administrative compliance approval before listing items.
            </p>
          </div>
          <div className="rounded-2xl border border-border-slate bg-surface-card p-5 space-y-2 shadow-[var(--shadow-level-1)]">
            <Truck className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Single-Seller Orders
            </h2>
            <p className="text-sm text-text-muted">
              Each order is dispatched directly by one merchant so tracking, fees, and accountability stay clear.
            </p>
          </div>
          <div className="rounded-2xl border border-border-slate bg-surface-card p-5 space-y-2 shadow-[var(--shadow-level-1)]">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Transparent Pricing
            </h2>
            <p className="text-sm text-text-muted">
              All catalog prices, discounts, and order terms come directly from merchant listings and platform governance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/products">
            <Button variant="pill" size="lg">
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/sell">
            <Button variant="outline" size="lg" className="rounded-full">
              Become a Merchant
            </Button>
          </Link>
        </div>
      </div>
    </StorefrontShell>
  );
}
