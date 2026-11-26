'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { MyShopManager } from '@/components/seller/MyShopManager';

export default function SellerShopPage() {
  return (
    <SellerPanelLayout title="My Shop Profile" subtitle="Branding, hours, delivery coverage & visibility">
      <MyShopManager />
    </SellerPanelLayout>
  );
}
