'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DashboardLayout, SUPER_ADMIN_NAV_ITEMS } from '@/components/dashboard';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onSearch?: (query: string) => void;
}

export function SuperAdminLayout({
  children,
  title = 'Super Admin Governance',
  subtitle = 'Marketplace compliance, merchants & taxonomy',
  activeTab,
  onTabChange,
  onSearch,
}: SuperAdminLayoutProps) {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} loginPath="/401">
      <DashboardLayout
        navItems={SUPER_ADMIN_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        title={title}
        subtitle={subtitle}
        brandTitle="Marto Governance"
        brandSubtitle="Super Admin Console"
        brandHref="/admin/dashboard"
        brandIcon={
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        }
        onSearch={onSearch}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
