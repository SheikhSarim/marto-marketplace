'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardSearch } from './DashboardSearch';
import { DashboardNavItem } from './navigation.config';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import { Menu, PanelLeftClose, PanelLeft, ArrowLeft } from 'lucide-react';

interface DashboardHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  userRole?: UserRole;
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  navItems?: DashboardNavItem[];
  actions?: React.ReactNode;
}

export function DashboardHeader({
  isCollapsed,
  onToggleCollapse,
  onOpenMobile,
  userRole = 'SUPER_ADMIN',
  title,
  subtitle,
  onSearch,
  navItems,
  actions,
}: DashboardHeaderProps) {
  const roleBadgeVariant =
    userRole === 'SUPER_ADMIN'
      ? 'info'
      : userRole === 'SELLER'
      ? 'success'
      : 'default';

  return (
    <header className="h-16 glass-header border-b border-border-slate text-on-surface px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Open Navigation Drawer"
          className="md:hidden p-2 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="hidden md:flex p-2 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 text-primary" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {title && (
          <div className="hidden lg:block min-w-0 mr-2">
            <h1 className="font-display text-sm font-bold text-on-surface truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-text-muted truncate leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <DashboardSearch onSearch={onSearch} navItems={navItems} />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Badge
          variant={roleBadgeVariant}
          size="sm"
          className="hidden sm:inline-flex font-mono uppercase"
        >
          {userRole}
        </Badge>

        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-on-surface hover:text-primary bg-surface-card hover:bg-surface-page px-3 py-1.5 rounded-full border border-border-slate transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Storefront</span>
        </Link>

        <NotificationBell />

        {actions}
      </div>
    </header>
  );
}
