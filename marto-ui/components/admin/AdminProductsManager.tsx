'use client';

import React from 'react';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export function AdminProductsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Global Products Moderation
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Cross-tenant SKU moderation and compliance takedowns.
        </p>
      </div>

      <FeatureUnavailable
        title="Global Admin Products Moderation API Pending"
        description="Cross-shop product moderation controls will activate automatically once GET /admin/products is published in the backend Swagger."
        endpointHint="GET /api/v1/admin/products"
        backHref="/admin/shops"
        backLabel="Inspect Shops Directory"
      />
    </div>
  );
}
