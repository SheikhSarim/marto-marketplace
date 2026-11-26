'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export default function CustomerOrdersPage() {
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
            My Orders
          </h1>

          <FeatureUnavailable
            title="Customer Order Tracking Pending"
            description="Your single-seller order timeline, shipment notes, and invoice receipts will appear here once the Orders API ships."
            endpointHint="GET /api/v1/orders"
            backHref="/account"
            backLabel="Back to Account"
          />
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
