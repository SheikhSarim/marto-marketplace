'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerProductsManager } from '@/components/seller/SellerProductsManager';

export default function SellerProductsPage() {
  return (
    <SellerPanelLayout title="Product Catalog" subtitle="SKUs, pricing schedules & media gallery">
      <SellerProductsManager />
    </SellerPanelLayout>
  );
}
