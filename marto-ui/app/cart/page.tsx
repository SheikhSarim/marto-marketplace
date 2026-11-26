'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  MapPin,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/providers/CartContext';
import { formatPKR } from '@/lib/format';

export default function CartPage() {
  const {
    items,
    activeShop,
    itemsCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <StorefrontShell>
      <div className="marto-container py-8 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
              Shopping Bag
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Marto fulfills one merchant per order for transparent dispatch and delivery accountability (BR-08).
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCart}>
              Clear Bag
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="Your shopping bag is empty"
            description="Add items from any verified Marto storefront to review them here."
            action={
              <Link href="/products">
                <Button variant="pill" size="sm">
                  Browse Products
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Single-seller item list */}
            <div className="lg:col-span-8 space-y-4">
              {activeShop && (
                <div className="rounded-2xl border border-border-slate bg-surface-card p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[var(--shadow-level-1)]">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary font-display font-bold text-base flex items-center justify-center shrink-0">
                      {activeShop.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-display font-semibold text-base text-on-surface truncate">
                          {activeShop.name}
                        </span>
                      </div>
                      {activeShop.city && (
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>Dispatches from {activeShop.city}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Single-Seller Order
                  </Badge>
                </div>
              )}

              <div className="rounded-2xl border border-border-slate bg-surface-card divide-y divide-border-slate shadow-[var(--shadow-level-1)] overflow-hidden">
                {items.map((item) => (
                  <div key={item.product.id} className="p-4 sm:p-5 flex gap-4">
                    <Link
                      href={`/products/${encodeURIComponent(item.product.id)}`}
                      className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-xl border border-border-slate bg-surface-container-low overflow-hidden shrink-0"
                    >
                      <SafeImage src={item.product.images[0]} alt={item.product.name} fill sizes="96px" />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${encodeURIComponent(item.product.id)}`}
                            className="font-display font-semibold text-base text-on-surface hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-text-muted mt-0.5 tabular-nums">
                            Unit price: {formatPKR(item.product.finalPrice)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label={`Remove ${item.product.name}`}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-status-danger hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="inline-flex items-center rounded-xl border border-border-slate bg-surface-page">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-2 text-text-muted hover:text-on-surface cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-bold tabular-nums text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-2 text-text-muted hover:text-on-surface cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-display font-bold text-base text-on-surface tabular-nums">
                          {formatPKR(item.product.finalPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <aside className="lg:col-span-4 rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-4 lg:sticky lg:top-24">
              <h2 className="font-display font-bold text-lg text-on-surface">
                Bag Summary ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
              </h2>

              <div className="space-y-2.5 text-sm border-t border-border-slate pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Items Subtotal</span>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {formatPKR(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Delivery Fee</span>
                  <span>
                    {typeof activeShop?.deliveryFee === 'number'
                      ? formatPKR(activeShop.deliveryFee)
                      : 'Provided by Shop API'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Platform Fee</span>
                  <span>Provided by Settings API</span>
                </div>
              </div>

              <div className="rounded-xl bg-surface-page border border-border-slate p-3 flex items-start gap-2 text-xs text-text-muted">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Statutory platform and delivery charges are never estimated locally and are calculated only from live backend API responses.
                </span>
              </div>

              <Link href="/checkout" className="block pt-1">
                <Button variant="pill" size="lg" className="w-full">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </aside>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
