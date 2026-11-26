'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/providers/CartContext';
import { formatPKR } from '@/lib/format';

export default function ProtectedCheckoutPage() {
  const { items, activeShop, subtotal } = useCart();

  return (
    <RoleGuard allowedRoles={['CUSTOMER']} loginPath="/customer/login">
      <StorefrontShell>
        <div className="marto-container py-8 sm:py-10 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Bag</span>
              </Link>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                Checkout
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Customer Verified</span>
            </span>
          </div>

          {items.length === 0 ? (
            <EmptyState
              title="No items in your bag"
              description="Add items from a verified storefront before starting checkout."
              action={
                <Link href="/products">
                  <Button variant="pill" size="sm">
                    Explore Catalog
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <FeatureUnavailable
                  title="Shipping Address & Checkout Order API Pending"
                  description="Address book selection, live delivery fee calculation, platform fee settings, and order creation go live automatically once the backend publishes the Orders & Addresses endpoints."
                  endpointHint="POST /api/v1/orders · GET /api/v1/addresses"
                />
              </div>

              <aside className="lg:col-span-5 rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-4">
                <h2 className="font-display font-bold text-lg text-on-surface">
                  Order Preview
                </h2>

                {activeShop && (
                  <div className="rounded-xl border border-border-slate bg-surface-page p-3 flex items-center gap-3">
                    <Store className="w-4 h-4 text-primary shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-on-surface">{activeShop.name}</p>
                      {activeShop.city && (
                        <p className="text-text-muted">Dispatches from {activeShop.city}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="divide-y divide-border-slate text-sm">
                  {items.map((item) => (
                    <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                      <span className="text-on-surface-variant truncate">
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-semibold text-on-surface tabular-nums shrink-0">
                        {formatPKR(item.product.finalPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border-slate pt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Items Subtotal</span>
                    <span className="font-bold text-on-surface tabular-nums">
                      {formatPKR(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Delivery & Platform Fees</span>
                    <span>Pending Backend API</span>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled
                  title="Order creation awaits POST /api/v1/orders backend availability"
                  className="w-full rounded-full"
                >
                  Place Order (Unavailable Until Order API Ships)
                </Button>
              </aside>
            </div>
          )}
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
