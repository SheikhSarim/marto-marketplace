'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { DashboardNavItem } from './navigation.config';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';
import { UserRole } from '@/types';
import { X } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  navItems: DashboardNavItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  userRole?: UserRole;
  brandTitle?: string;
  brandSubtitle?: string;
  brandHref?: string;
  brandIcon?: React.ReactNode;
  customUsageCard?: React.ReactNode;
  showUsageCard?: boolean;
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  navItems,
  activeTab,
  onTabChange,
  userRole,
  brandTitle = 'Marto Console',
  brandSubtitle = 'Operations',
  brandHref = '/',
  brandIcon,
  customUsageCard,
  showUsageCard = true,
}: SidebarProps) {
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  const defaultIcon = (
    <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-display font-bold text-base shrink-0">
      M
    </div>
  );

  return (
    <>
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close Navigation Drawer"
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') onCloseMobile();
          }}
          className="fixed inset-0 bg-surface-midnight/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 md:z-20 bg-surface-midnight border-r border-white/10 text-white flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'w-72 translate-x-0 shadow-[var(--shadow-level-3)]'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="h-14 flex items-center justify-between border-b border-white/10 pb-3 mb-2 shrink-0">
            <Link
              href={brandHref}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity ${
                isCollapsed ? 'md:justify-center md:w-full' : ''
              }`}
            >
              {brandIcon || defaultIcon}
              <div className={`min-w-0 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                <div className="font-display font-bold text-sm text-white truncate">
                  {brandTitle}
                </div>
                <div className="text-[11px] text-teal-300 font-medium truncate">
                  {brandSubtitle}
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close Navigation"
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <SidebarNavigation
            items={navItems}
            activeTab={activeTab}
            onTabChange={onTabChange}
            isCollapsed={isCollapsed}
            userRole={userRole}
            onItemClick={onCloseMobile}
          />

          <SidebarFooter
            isCollapsed={isCollapsed}
            customUsageCard={customUsageCard}
            showUsageCard={showUsageCard}
          />
        </div>
      </aside>
    </>
  );
}
