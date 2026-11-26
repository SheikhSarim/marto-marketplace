'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export default function CustomerOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ? decodeURIComponent(params.id) : '';

  return (
    <RoleGuard allowedRoles={['CUSTOMER']} loginPath="/customer/login">
      <StorefrontShell>
        <div className="marto-container py-8 sm:py-10 space-y-6 max-w-3xl">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>

          <h1 className="font-display font-bold text-2xl text-on-surface">
            Order Details {orderId ? `(${orderId})` : ''}
          </h1>

          <FeatureUnavailable
            title="Order Detail Service Pending"
            description="Single-seller shipment tracking and item breakdown will load automatically once GET /orders/:id is exposed."
            endpointHint="GET /api/v1/orders/:id"
            backHref="/account/orders"
            backLabel="Back to Orders"
          />
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
