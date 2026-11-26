'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export default function CustomerAddressesPage() {
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
            Saved Shipping Addresses
          </h1>

          <FeatureUnavailable
            title="Customer Address Book Service Pending"
            description="Add, edit, and choose default Pakistani shipping addresses once the backend Addresses API is enabled."
            endpointHint="GET /api/v1/addresses"
            backHref="/account"
            backLabel="Back to Account"
          />
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
