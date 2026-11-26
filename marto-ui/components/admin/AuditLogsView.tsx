'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function AuditLogsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Security Audit Logs
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Immutable log of seller approvals, category governance, and role actions.
        </p>
      </div>

      <FeatureUnavailable
        title="Security Audit Logs API Pending"
        description="Immutable administrative audit trails will display here once GET /admin/audit-logs is exposed by the backend."
        endpointHint="GET /api/v1/admin/audit-logs"
        backHref="/admin/dashboard"
        backLabel="Back to Overview"
      />
    </div>
  );
}
