'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerDashboard } from '@/components/seller/SellerDashboard';

export default function SellerDashboardPage() {
  return (
    <SellerPanelLayout title="Seller Dashboard" subtitle="Storefront metrics & quick overview">
      <SellerDashboard />
    </SellerPanelLayout>
  );
}
