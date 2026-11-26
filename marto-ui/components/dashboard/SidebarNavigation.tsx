'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardNavItem } from './navigation.config';
import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface SidebarNavigationProps {
  items: DashboardNavItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  isCollapsed?: boolean;
  userRole?: UserRole;
  onItemClick?: () => void;
}

export function SidebarNavigation({
  items,
  activeTab,
  onTabChange,
  isCollapsed = false,
  userRole,
  onItemClick,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  const filteredItems = items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!userRole) return true;
    return item.roles.includes(userRole);
  });

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        className="space-y-1 py-2 overflow-y-auto overflow-x-hidden flex-1"
        aria-label="Console Navigation"
      >
        {filteredItems.map((item) => {
          const Icon = item.icon;

          const isActive = activeTab
            ? activeTab === item.id
            : item.href
            ? pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(`${item.href}/`))
            : false;

          const badgeVariant = item.badgeVariant || 'warning';

          const content = (
            <div
              className={`flex items-center gap-3 w-full ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate text-[13px] font-medium">
                    {item.label}
                  </span>
                )}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <Badge variant={badgeVariant} size="sm">
                  {item.badge}
                </Badge>
              )}
            </div>
          );

          const className = `group w-full flex items-center rounded-xl transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary-container select-none ${
            isCollapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5'
          } ${
            isActive
              ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`;

          if (isCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  {item.href && !onTabChange ? (
                    <Link
                      href={item.href}
                      onClick={onItemClick}
                      className={className}
                      aria-label={item.label}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (onTabChange) {
                          onTabChange(item.id);
                        }
                        onItemClick?.();
                      }}
                      className={className}
                      aria-label={item.label}
                    >
                      {content}
                    </button>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="font-bold">({item.badge})</span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          if (item.href && !onTabChange) {
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onItemClick}
                className={className}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onTabChange?.(item.id);
                onItemClick?.();
              }}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
