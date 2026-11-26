'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight } from 'lucide-react';
import { DashboardNavItem } from './navigation.config';

interface DashboardSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  navItems?: DashboardNavItem[];
  className?: string;
}

export function DashboardSearch({
  placeholder = 'Search or jump to section...',
  onSearch,
  navItems = [],
  className = '',
}: DashboardSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  const matchedRoutes = navItems.filter(
    (item) =>
      item.href &&
      item.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
      <div className={`relative flex items-center max-w-xs sm:max-w-md w-full ${className}`}>
        <Search className="w-4 h-4 text-text-subtle absolute left-3 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (!onSearch && navItems.length > 0) setPaletteOpen(true);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full h-9 pl-9 pr-14 rounded-full border border-border-slate bg-surface-page text-xs text-on-surface placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-2.5 p-1 rounded-full text-text-muted hover:text-on-surface cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open quick navigation palette"
            className="hidden sm:inline-flex items-center gap-0.5 absolute right-2 px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-card border border-border-slate rounded-full cursor-pointer hover:border-primary"
          >
            ⌘K
          </button>
        )}
      </div>

      {/* ⌘K Command Palette */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-surface-midnight/50 backdrop-blur-xs"
          onClick={() => setPaletteOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Quick navigation"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border-slate bg-surface-card shadow-[var(--shadow-level-3)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-border-slate flex items-center gap-2.5">
              <Search className="w-4 h-4 text-primary shrink-0" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={handleChange}
                placeholder="Type a section name to jump..."
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-text-subtle focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-on-surface cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {matchedRoutes.length === 0 ? (
                <p className="p-4 text-center text-xs text-text-muted">
                  No matching navigation destinations.
                </p>
              ) : (
                matchedRoutes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setPaletteOpen(false);
                        if (item.href) router.push(item.href);
                      }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-page text-left text-sm text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
                        <Icon className="w-4 h-4 text-primary" />
                        <span>{item.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
