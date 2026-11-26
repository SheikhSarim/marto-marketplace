'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Store,
  MapPin,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useCart } from '@/providers/CartContext';
import { SafeImage } from '@/components/ui/SafeImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPKR } from '@/lib/format';

export function CartDrawer() {
  const {
    items,
    activeShop,
    itemsCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-surface-midnight/50 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-md bg-surface-card border-l border-border-slate shadow-[var(--shadow-level-3)] flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-slate flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">
                Your Bag ({itemsCount})
              </h2>
              <p className="text-xs text-text-muted">Single-seller order (BR-08)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart drawer"
            className="p-2 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-low border border-border-slate text-text-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-base text-on-surface">
                Your shopping bag is empty
              </h3>
              <p className="text-sm text-text-muted mt-1.5 max-w-xs">
                Explore curated items from verified merchants across Pakistan.
              </p>
              <Link href="/products" onClick={closeDrawer} className="mt-5">
                <Button variant="pill" size="sm">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* BR-08 Single-Seller Shop Header Card */}
              {activeShop && (
                <div className="rounded-xl border border-border-slate bg-surface-page p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-display font-bold text-sm shrink-0">
                      {activeShop.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-sm text-on-surface truncate">
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
                    Single Shop
                  </Badge>
                </div>
              )}

              {/* Line Items */}
              <div className="divide-y divide-border-slate rounded-2xl border border-border-slate bg-surface-card overflow-hidden">
                {items.map((item) => (
                  <div key={item.product.id} className="p-3.5 flex gap-3.5">
                    <Link
                      href={`/products/${encodeURIComponent(item.product.id)}`}
                      onClick={closeDrawer}
                      className="relative w-18 h-18 rounded-xl bg-surface-container-low border border-border-slate overflow-hidden shrink-0"
                    >
                      <SafeImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="72px"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${encodeURIComponent(item.product.id)}`}
                          onClick={closeDrawer}
                          className="font-semibold text-sm text-on-surface line-clamp-2 hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label={`Remove ${item.product.name}`}
                          className="p-1 rounded text-text-subtle hover:text-status-danger transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-lg border border-border-slate bg-surface-page">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-text-muted hover:text-on-surface cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold tabular-nums text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="p-1.5 text-text-muted hover:text-on-surface cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-on-surface tabular-nums">
                          {formatPKR(item.product.finalPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-text-muted hover:text-status-danger transition-colors cursor-pointer"
                >
                  Clear bag
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border-slate bg-surface-page space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Items Subtotal</span>
                <span className="font-bold text-on-surface tabular-nums">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Delivery & Platform Fees</span>
                <span className="font-medium text-on-surface-variant">
                  {typeof activeShop?.deliveryFee === 'number'
                    ? formatPKR(activeShop.deliveryFee)
                    : 'Calculated at checkout API'}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-surface-card border border-border-slate px-3 py-2 flex items-start gap-2 text-[11px] text-text-muted">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                Final delivery and statutory platform fees are fetched directly from the backend during checkout.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link href="/cart" onClick={closeDrawer}>
                <Button variant="outline" className="w-full rounded-full">
                  View Bag
                </Button>
              </Link>
              <Link href="/checkout" onClick={closeDrawer}>
                <Button variant="pill" className="w-full">
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
