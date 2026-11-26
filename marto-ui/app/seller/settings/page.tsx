'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { FeatureUnavailable } from '@/components/ui/FeatureUnavailable';

export default function SellerSettingsPage() {
  return (
    <SellerPanelLayout title="Seller Settings" subtitle="Payout bank account & notification preferences">
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            Account & Payout Settings
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Bank payout details, tax preferences, and dispatch alert channels.
          </p>
        </div>

        <FeatureUnavailable
          title="Seller Account Settings API Pending"
          description="Self-service bank IBAN updates and seller notification preferences will activate automatically once the backend settings endpoints are published."
          endpointHint="PATCH /api/v1/sellers/me/settings"
          backHref="/seller/shop"
          backLabel="Manage Shop Profile"
        />
      </div>
    </SellerPanelLayout>
  );
}
