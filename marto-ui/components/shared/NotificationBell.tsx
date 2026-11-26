'use client';

import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-2 rounded-lg bg-surface-card text-on-surface-variant hover:text-on-surface hover:bg-surface-page border border-border-slate transition-colors"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface-card rounded-2xl shadow-[var(--shadow-level-3)] border border-border-slate z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="px-4 py-3 bg-surface-page border-b border-border-slate flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-semibold text-sm text-on-surface">
              <Bell className="w-4 h-4 text-primary" />
              <span>Notifications</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-text-muted hover:text-on-surface rounded-lg"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3">
            <FeatureUnavailable
              compact
              title="Notifications Feed Pending"
              description="Live alerts will appear here once the notifications service endpoint is enabled."
              endpointHint="GET /api/v1/notifications"
            />
          </div>
        </div>
      )}
    </div>
  );
}
