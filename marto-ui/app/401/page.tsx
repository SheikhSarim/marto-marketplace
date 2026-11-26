'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  LogOut,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get('reason');
  const from = searchParams.get('from') || '/';
  const required = searchParams.get('required') || '';
  const roleParam = searchParams.get('role');

  const { user, isAuthenticated, logout } = useAuthStore();

  const isRoleMismatch =
    reason === 'role_mismatch' || (isAuthenticated && Boolean(user));
  const currentRole = user?.role || roleParam || 'GUEST';

  const getLoginTarget = () => {
    if (from.startsWith('/admin') || required.includes('SUPER_ADMIN')) {
      return `/admin/login?from=${encodeURIComponent(from)}`;
    }
    if (from.startsWith('/seller') || required.includes('SELLER')) {
      return `/seller/login?from=${encodeURIComponent(from)}`;
    }
    return `/customer/login?from=${encodeURIComponent(from)}`;
  };

  const handleSwitchAccount = async () => {
    await logout();
    router.push(getLoginTarget());
  };

  return (
    <AuthShell
      title={isRoleMismatch ? 'Access Restricted' : 'Authentication Required'}
      subtitle={
        isRoleMismatch
          ? 'Your active session does not have permission to open this area.'
          : 'Please sign in with the appropriate Marto account to continue.'
      }
      badge="HTTP 401 · Access Control"
      icon={
        isRoleMismatch ? (
          <AlertTriangle className="w-6 h-6" />
        ) : (
          <Lock className="w-6 h-6" />
        )
      }
    >
      <div className="space-y-5">
        {isRoleMismatch && user && (
          <div className="p-4 rounded-xl bg-surface-page border border-border-slate flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="text-xs text-text-muted">Signed in as</div>
              <div className="font-semibold text-on-surface truncate">{user.email}</div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/12 text-amber-800 border border-amber-500/25 shrink-0">
              {currentRole}
            </span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Requested route: <code className="font-mono font-semibold">{from}</code>
            {required && (
              <>
                {' '}
                · Required role: <code className="font-mono font-semibold">{required}</code>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isRoleMismatch ? (
            <Button type="button" onClick={handleSwitchAccount} className="w-full">
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </Button>
          ) : (
            <Link
              href={getLoginTarget()}
              className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
            >
              <span>Continue to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
