'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function SellerRevenueView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Revenue & Payouts
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Settlement ledger, completed order earnings, and statutory platform fee statements.
        </p>
      </div>

      <FeatureUnavailable
        title="Seller Revenue Ledger API Pending"
        description="Net earnings, pending payouts, and fee statements will display live PKR figures once the backend publishes the seller revenue endpoints."
        endpointHint="GET /api/v1/seller/revenue"
        backHref="/seller/dashboard"
        backLabel="Back to Dashboard"
      />
    </div>
  );
}
