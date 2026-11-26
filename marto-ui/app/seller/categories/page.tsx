'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerCategoriesManager } from '@/components/seller/SellerCategoriesManager';

export default function SellerCategoriesPage() {
  return (
    <SellerPanelLayout title="Shop Collections" subtitle="Custom taxonomy & navigation groups">
      <SellerCategoriesManager />
    </SellerPanelLayout>
  );
}
