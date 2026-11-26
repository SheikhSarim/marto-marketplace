'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerProductsManager } from '@/components/seller/SellerProductsManager';

export default function SellerNewProductPage() {
  return (
    <SellerPanelLayout title="Add Product" subtitle="Publish a new listing into your storefront">
      <SellerProductsManager initialMode="create" />
    </SellerPanelLayout>
  );
}
