'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { SellerProductsManager } from '@/components/seller/SellerProductsManager';

export default function SellerEditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ? decodeURIComponent(params.id) : undefined;

  return (
    <SellerPanelLayout title="Edit Product" subtitle="Update SKU metadata, stock & images">
      <SellerProductsManager initialMode="edit" editProductId={productId} />
    </SellerPanelLayout>
  );
}
