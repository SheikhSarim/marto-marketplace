'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerOrdersManager } from '@/components/seller/SellerOrdersManager';

export default function SellerOrdersPage() {
  return (
    <SellerPanelLayout title="Customer Orders" subtitle="Single-seller dispatch & fulfillment pipeline">
      <SellerOrdersManager />
    </SellerPanelLayout>
  );
}
