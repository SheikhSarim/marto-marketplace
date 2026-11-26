'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { AdminCategoriesManager } from '@/components/admin/AdminCategoriesManager';

export default function AdminCategoriesPage() {
  return (
    <SuperAdminLayout title="Categories & Collections" subtitle="Platform taxonomy governance">
      <AdminCategoriesManager />
    </SuperAdminLayout>
  );
}
