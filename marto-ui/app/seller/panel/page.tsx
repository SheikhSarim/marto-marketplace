'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerDashboard } from '@/components/seller/SellerDashboard';

export default function SellerPanelPage() {
  return (
    <SellerPanelLayout title="Seller Dashboard" subtitle="Storefront metrics & quick overview">
      <SellerDashboard />
    </SellerPanelLayout>
  );
}
