'use client';

import React from 'react';
import { Store } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { DashboardLayout, SELLER_NAV_ITEMS } from '@/components/dashboard';
import { useMyShop } from '@/hooks/queries/useMarketplaceQueries';

interface SellerPanelLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onSearch?: (query: string) => void;
}

export function SellerPanelLayout({
  children,
  title = 'Seller Operations',
  subtitle = 'Storefront catalog, collections & fulfillment',
  activeTab,
  onTabChange,
  onSearch,
}: SellerPanelLayoutProps) {
  const { data: shopRes } = useMyShop();
  const shopName = shopRes?.data?.name || 'Marto Merchant';

  return (
    <RoleGuard allowedRoles={['SELLER', 'SUPER_ADMIN']} loginPath="/seller/login">
      <DashboardLayout
        navItems={SELLER_NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        title={title}
        subtitle={subtitle}
        brandTitle={shopName}
        brandSubtitle="Seller Console"
        brandHref="/seller/dashboard"
        brandIcon={
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
        }
        onSearch={onSearch}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
