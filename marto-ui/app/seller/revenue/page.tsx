'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerRevenueView } from '@/components/seller/SellerRevenueView';

export default function SellerRevenuePage() {
  return (
    <SellerPanelLayout title="Revenue & Payouts" subtitle="Net settlements and fee breakdowns">
      <SellerRevenueView />
    </SellerPanelLayout>
  );
}
