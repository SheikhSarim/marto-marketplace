'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { formatDate } from '@/lib/format';

export default function CustomerProfilePage() {
  const { user } = useAuthStore();

  return (
    <RoleGuard allowedRoles={['CUSTOMER']} loginPath="/customer/login">
      <StorefrontShell>
        <div className="marto-container py-8 sm:py-10 space-y-6 max-w-3xl">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </Link>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
            Customer Profile
          </h1>

          <div className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Full Name</span>
              <p className="font-medium text-on-surface mt-1">{user?.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Email Address</span>
              <p className="font-medium text-on-surface mt-1">{user?.email || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Phone</span>
              <p className="font-medium text-on-surface mt-1">{user?.phone || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Member Since</span>
              <p className="font-medium text-on-surface mt-1">
                {user?.createdAt ? formatDate(user.createdAt) : '—'}
              </p>
            </div>
          </div>

          <FeatureUnavailable
            compact
            title="Profile Editing Pending Backend Endpoint"
            description="Self-service customer profile edits will enable automatically once the profile mutation endpoint is exposed."
            endpointHint="PATCH /api/v1/customers/me"
          />
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
