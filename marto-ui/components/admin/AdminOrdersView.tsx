'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function AdminOrdersView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Platform Orders Audit
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Oversight across all single-seller customer orders and dispute states.
        </p>
      </div>

      <FeatureUnavailable
        title="Global Orders Audit API Pending"
        description="Cross-merchant order telemetry and dispute auditing will enable automatically once GET /admin/orders ships."
        endpointHint="GET /api/v1/admin/orders"
        backHref="/admin/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
