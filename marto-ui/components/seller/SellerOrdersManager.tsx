'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function SellerOrdersManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Customer Orders
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Single-seller order fulfillment pipeline following BR-08 & §15 status transitions.
        </p>
      </div>

      <FeatureUnavailable
        title="Seller Order Management API Pending"
        description="Order confirmation, dispatch updates, and shipment tracking controls will enable automatically once the backend exposes the seller order endpoints."
        endpointHint="GET /api/v1/seller/orders"
        backHref="/seller/dashboard"
        backLabel="Back to Dashboard"
      />
    </div>
  );
}
