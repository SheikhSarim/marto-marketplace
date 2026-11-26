'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { AdminOrdersView } from '@/components/admin/AdminOrdersView';

export default function AdminOrdersPage() {
  return (
    <SuperAdminLayout title="Platform Orders" subtitle="Cross-tenant order audit">
      <AdminOrdersView />
    </SuperAdminLayout>
  );
}
