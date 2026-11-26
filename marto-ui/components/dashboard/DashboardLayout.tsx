'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardNavItem, getNavItemsForRole } from './navigation.config';
import { UserRole } from '@/types';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { CLIENT_STORAGE_KEYS, safeGetStorage, safeSetStorage } from '@/lib/storage';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems?: DashboardNavItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  title?: string;
  subtitle?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  brandHref?: string;
  brandIcon?: React.ReactNode;
  customUsageCard?: React.ReactNode;
  showUsageCard?: boolean;
  headerActions?: React.ReactNode;
  onSearch?: (query: string) => void;
  maxWidthClassName?: string;
}

export function DashboardLayout({
  children,
  navItems: customNavItems,
  activeTab,
  onTabChange,
  title,
  subtitle,
  brandTitle,
  brandSubtitle,
  brandHref,
  brandIcon,
  customUsageCard,
  showUsageCard = true,
  headerActions,
  onSearch,
  maxWidthClassName = 'max-w-[1360px]',
}: DashboardLayoutProps) {
  const { user } = useAuthStore();
  const userRole: UserRole = user?.role || 'SUPER_ADMIN';

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = safeGetStorage<boolean | null>(CLIENT_STORAGE_KEYS.SIDEBAR_COLLAPSED, null);
    if (typeof saved === 'boolean') {
      setIsCollapsed(saved);
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      safeSetStorage(CLIENT_STORAGE_KEYS.SIDEBAR_COLLAPSED, next);
      return next;
    });
  };

  const resolvedNavItems = customNavItems || getNavItemsForRole(userRole);

  return (
    <div className="min-h-screen bg-surface-page text-on-surface flex flex-row font-sans">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        navItems={resolvedNavItems}
        activeTab={activeTab}
        onTabChange={onTabChange}
        userRole={userRole}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
        brandHref={brandHref}
        brandIcon={brandIcon}
        customUsageCard={customUsageCard}
        showUsageCard={showUsageCard}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-surface-page">
        <DashboardHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setIsMobileOpen(true)}
          userRole={userRole}
          title={title}
          subtitle={subtitle}
          onSearch={onSearch}
          navItems={resolvedNavItems}
          actions={headerActions}
        />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className={`${maxWidthClassName} mx-auto w-full`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
