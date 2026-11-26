import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Store } from 'lucide-react';

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-border-slate bg-surface-card text-on-surface-variant">
      <div className="marto-container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary font-display font-bold text-base flex items-center justify-center">
              M
            </span>
            <span className="font-display font-bold text-lg text-on-surface">
              Marto
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Curated multi-vendor commerce for Pakistan. Verified merchants, transparent PKR pricing, and dedicated single-seller fulfillment.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm text-on-surface mb-3">
            Marketplace
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link href="/products" className="hover:text-primary transition-colors">
                Browse Products
              </Link>
            </li>
            <li>
              <Link href="/shops" className="hover:text-primary transition-colors">
                Merchant Directory
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-primary transition-colors">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                About Marto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm text-on-surface mb-3">
            Customer & Seller Portals
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link href="/customer/login" className="hover:text-primary transition-colors">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/sell" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" />
                <span>Become a Seller</span>
              </Link>
            </li>
            <li>
              <Link href="/sell/application-status" className="hover:text-primary transition-colors">
                Seller Application Status
              </Link>
            </li>
            <li>
              <Link href="/seller/login" className="hover:text-primary transition-colors">
                Seller Console Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-sm text-on-surface mb-3">
            Trust & Governance
          </h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Support & Contact
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Admin Portal</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-slate bg-surface-page/70">
        <div className="marto-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Marto Marketplace (marto-online.com). All rights reserved.</p>
          <p>Single-Seller Order Fulfillment · Prices in PKR</p>
        </div>
      </div>
    </footer>
  );
}
