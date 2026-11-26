'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { AdminShopsManager } from '@/components/admin/AdminShopsManager';

export default function AdminShopsPage() {
  return (
    <SuperAdminLayout title="Shops Directory" subtitle="Storefront status governance">
      <AdminShopsManager />
    </SuperAdminLayout>
  );
}
