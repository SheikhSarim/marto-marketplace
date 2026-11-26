'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Loader2, ShieldCheck } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  loginPath?: string;
}

export function RoleGuard({ allowedRoles, children, loginPath }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    isAuthenticated,
    hasCheckedSession,
    isCheckingSession,
    checkSession,
  } = useAuthStore();

  useEffect(() => {
    if (!hasCheckedSession) {
      checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  useEffect(() => {
    if (!hasCheckedSession || isCheckingSession) return;

    if (!isAuthenticated || !user) {
      if (loginPath) {
        router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`);
      } else {
        router.replace(
          `/401?reason=not_logged_in&from=${encodeURIComponent(pathname)}`
        );
      }
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      router.replace(
        `/401?reason=role_mismatch&from=${encodeURIComponent(
          pathname
        )}&role=${encodeURIComponent(user.role)}&required=${encodeURIComponent(
          allowedRoles.join(',')
        )}`
      );
    }
  }, [
    hasCheckedSession,
    isCheckingSession,
    isAuthenticated,
    user,
    allowedRoles,
    loginPath,
    pathname,
    router,
  ]);

  if (!hasCheckedSession || isCheckingSession) {
    return (
      <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Verifying session access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
