'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/admin/SuperAdminLayout';
import { PlatformSettingsManager } from '@/components/admin/PlatformSettingsManager';

export default function AdminSettingsPage() {
  return (
    <SuperAdminLayout title="Platform Settings" subtitle="Statutory fee rules & payment policy">
      <PlatformSettingsManager />
    </SuperAdminLayout>
  );
}
