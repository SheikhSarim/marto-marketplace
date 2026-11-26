'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { SuperAdminDashboard } from '@/components/admin/SuperAdminDashboard';

export default function AdminDashboardPage() {
  return (
    <SuperAdminLayout title="Governance Overview" subtitle="Live platform operations">
      <SuperAdminDashboard />
    </SuperAdminLayout>
  );
}
