'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  User,
  Store,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useCart } from '@/providers/CartContext';
import { Button } from '@/components/ui/button';
import { CLIENT_STORAGE_KEYS, safeGetStorage, safeSetStorage } from '@/lib/storage';

export function StorefrontHeader() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemsCount, openDrawer } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('storefront-search-input');
        el?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) {
      router.push('/products');
      return;
    }
    const recent = safeGetStorage<string[]>(CLIENT_STORAGE_KEYS.RECENT_SEARCHES, []);
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 8);
    safeSetStorage(CLIENT_STORAGE_KEYS.RECENT_SEARCHES, next);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-border-slate">
      <div className="marto-container h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-primary-container text-on-primary font-display font-bold text-lg flex items-center justify-center shadow-[var(--shadow-level-1)]">
              M
            </span>
            <span className="font-display font-bold text-xl tracking-tight text-on-surface">
              Marto
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-on-surface-variant">
            <Link href="/products" className="hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/shops" className="hover:text-primary transition-colors">
              Shops
            </Link>
            <Link href="/sell" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Sell on Marto</span>
            </Link>
          </nav>
        </div>

        {/* Center: Pill Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="storefront-search-input"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products across verified shops..."
            aria-label="Search products"
            className="w-full h-10 pl-10 pr-16 rounded-full bg-surface-card border border-border-slate text-sm text-on-surface placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container transition-all"
          />
          <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-low border border-border-slate text-[11px] font-mono text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            ⌘K
          </kbd>
        </form>

        {/* Right: Cart & Auth */}
        <div className="flex items-center gap-2.5">
          {/* Cart Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Open shopping bag (${itemsCount} items)`}
            className="relative h-10 px-3.5 rounded-full border border-border-slate bg-surface-card hover:bg-surface-container-low text-on-surface flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Bag</span>
            {itemsCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary-container text-on-primary text-[11px] font-bold flex items-center justify-center tabular-nums">
                {itemsCount}
              </span>
            )}
          </button>

          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="h-10 px-3.5 rounded-full border border-border-slate bg-surface-card hover:bg-surface-container-low flex items-center gap-2 text-sm font-semibold text-on-surface transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border-slate bg-surface-card shadow-[var(--shadow-level-3)] py-2 z-40">
                    <div className="px-4 py-2 border-b border-border-slate">
                      <p className="text-sm font-semibold text-on-surface truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>

                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-page"
                        >
                          <User className="w-4 h-4 text-text-muted" />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-page"
                        >
                          <Package className="w-4 h-4 text-text-muted" />
                          <span>Orders</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'SELLER' && (
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-page"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Seller Panel</span>
                      </Link>
                    )}

                    {user.role === 'SUPER_ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-on-surface hover:bg-surface-page"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Super Admin</span>
                      </Link>
                    )}

                    <div className="border-t border-border-slate mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-status-danger hover:bg-rose-50 text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/customer/login">
                <Button variant="outline" size="sm" className="rounded-full px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/customer/register">
                <Button variant="pill" size="sm" className="px-4">
                  Join
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container-low cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border-slate bg-surface-card p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-page border border-border-slate text-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </form>
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-page"
            >
              Browse Catalog
            </Link>
            <Link
              href="/shops"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-page"
            >
              Verified Shops
            </Link>
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-surface-page text-primary font-semibold"
            >
              Sell on Marto
            </Link>
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/customer/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/customer/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="pill" className="w-full" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
