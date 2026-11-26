'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { AdminProductsManager } from '@/components/admin/AdminProductsManager';

export default function AdminProductsPage() {
  return (
    <SuperAdminLayout title="Products Moderation" subtitle="Cross-tenant SKU compliance">
      <AdminProductsManager />
    </SuperAdminLayout>
  );
}
