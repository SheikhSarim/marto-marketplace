'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { AdminSellersManager } from '@/components/admin/AdminSellersManager';

export default function AdminSellersPage() {
  return (
    <SuperAdminLayout title="Sellers Governance" subtitle="Approve or reject merchant onboarding">
      <AdminSellersManager />
    </SuperAdminLayout>
  );
}
