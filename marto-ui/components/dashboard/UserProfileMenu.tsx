'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { UserRole } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { LogOut, User, ChevronDown, ShoppingBag } from 'lucide-react';

interface UserProfileMenuProps {
  isCollapsed?: boolean;
}

export function UserProfileMenu({ isCollapsed = false }: UserProfileMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const role: UserRole = user?.role || 'GUEST';
  const displayName = user?.name || 'Authenticated User';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.avatarUrl;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      if (role === 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else if (role === 'SELLER') {
        router.push('/seller/login');
      } else {
        router.push('/');
      }
    }
  };

  const roleVariant =
    role === 'SUPER_ADMIN'
      ? 'info'
      : role === 'SELLER'
      ? 'success'
      : 'default';

  const menuTrigger = (
    <button
      type="button"
      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-container cursor-pointer ${
        isCollapsed
          ? 'justify-center hover:bg-white/10'
          : 'hover:bg-white/10 bg-white/5 border border-white/10 text-left'
      }`}
      aria-label="Account Menu"
    >
      <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/20">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
        <AvatarFallback className="bg-primary-container text-on-primary font-bold text-xs">
          {initials || <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {!isCollapsed && (
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-white truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          {displayEmail && (
            <span className="text-[10px] text-slate-400 block truncate">
              {displayEmail}
            </span>
          )}
        </div>
      )}
    </button>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <DropdownMenu>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-semibold">{displayName}</div>
              {displayEmail && <div className="text-[10px] opacity-80">{displayEmail}</div>}
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger asChild>{menuTrigger}</DropdownMenuTrigger>
        )}

        <DropdownMenuContent
          align={isCollapsed ? 'start' : 'center'}
          side={isCollapsed ? 'right' : 'top'}
          sideOffset={8}
          className="w-64 bg-surface-card border-border-slate text-on-surface p-2 shadow-[var(--shadow-level-3)] z-50 rounded-2xl"
        >
          <div className="px-2.5 py-2 mb-1 rounded-xl bg-surface-page border border-border-slate">
            <div className="text-xs font-bold text-on-surface truncate">{displayName}</div>
            {displayEmail && (
              <div className="text-[11px] text-text-muted truncate">{displayEmail}</div>
            )}
            <div className="mt-2 pt-2 border-t border-border-slate flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-medium">Role</span>
              <Badge variant={roleVariant} size="sm" className="font-mono uppercase">
                {role}
              </Badge>
            </div>
          </div>

          <DropdownMenuItem asChild>
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xs text-on-surface hover:bg-surface-page cursor-pointer py-2 rounded-xl"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>View Storefront</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-xs text-status-danger hover:bg-rose-50 cursor-pointer py-2 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
