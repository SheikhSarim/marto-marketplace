'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function PlatformSettingsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Platform Settings & Fee Rules
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Statutory platform fee rates, payment gateways, and KYC enforcement rules.
        </p>
      </div>

      <FeatureUnavailable
        title="Platform Settings API Pending"
        description="Configuration for statutory per-order fees, COD policies, and support channels goes live automatically once /admin/settings is published."
        endpointHint="GET /api/v1/admin/settings"
        backHref="/admin/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
