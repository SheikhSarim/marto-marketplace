'use client';

import React from 'react';
import { useCart } from '@/providers/CartContext';
import { AlertTriangle, ShoppingCart, Store, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SingleSellerModal() {
  const { conflictModal, resolveConflict } = useCart();

  if (!conflictModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="single-seller-rule-title"
    >
      <div className="w-full max-w-md bg-surface-card rounded-2xl shadow-[var(--shadow-level-3)] overflow-hidden border border-border-slate">
        <div className="p-5 bg-amber-50/70 border-b border-amber-200/70 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="single-seller-rule-title"
              className="text-base font-display font-semibold text-on-surface"
            >
              Single-Seller Order Rule
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Each Marto order can only contain products from one shop (BR-08)
            </p>
          </div>
          <button
            type="button"
            onClick={() => resolveConflict('cancel')}
            className="p-1 text-text-muted hover:text-on-surface rounded-lg"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm text-text-muted">
          <p className="leading-relaxed">
            Your cart currently holds items from{' '}
            <span className="font-semibold text-on-surface">
              {conflictModal.currentShopName}
            </span>
            . To guarantee direct seller dispatch, orders cannot mix items from different shops.
          </p>

          <div className="bg-surface-page p-3.5 rounded-xl border border-border-slate space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted font-medium">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                Current Shop
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <Store className="w-3.5 h-3.5" />
                New Shop
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface truncate max-w-[44%]">
                {conflictModal.currentShopName}
              </span>
              <span className="font-semibold text-primary truncate max-w-[44%]">
                {conflictModal.newShopName}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface-page border-t border-border-slate flex flex-col sm:flex-row gap-2.5 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resolveConflict('cancel')}
          >
            Keep Current Cart
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => resolveConflict('replace')}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Clear Cart & Add Item</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
