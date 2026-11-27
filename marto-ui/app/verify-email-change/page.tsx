'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailCheck,
  ShoppingBag,
  Store,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { queryKeys } from '@/hooks/queries/useMarketplaceQueries';
import { AuthShell } from '@/components/auth/AuthShell';

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams();
  const token = (searchParams.get('token') || '').trim();
  const queryClient = useQueryClient();

  const { user, isAuthenticated, verifyEmailChange, checkSession } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [message, setMessage] = useState<string>(
    token
      ? 'Verifying your new email address...'
      : 'No verification token was found in this link.'
  );

  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setStatusCode(400);
      setMessage('No email change verification token was found in this URL.');
      return;
    }

    if (attemptedTokenRef.current === token) {
      return;
    }
    attemptedTokenRef.current = token;

    let active = true;

    (async () => {
      setStatus('loading');
      const res = await verifyEmailChange(token);
      if (!active) return;

      if (res.success) {
        setStatus('success');
        setStatusCode(200);
        setMessage(res.message || 'Email address updated successfully.');
        await checkSession(true).catch(() => null);
        queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      } else {
        setStatus('error');
        setStatusCode(res.statusCode ?? 400);
        setMessage(res.message || 'Invalid or expired verification token.');
      }
    })();

    return () => {
      active = false;
    };
  }, [token, verifyEmailChange, checkSession, queryClient]);

  const profileHref =
    isAuthenticated && user?.role === 'SELLER'
      ? '/seller/settings'
      : '/account/profile';

  return (
    <AuthShell
      title="Email change verification"
      subtitle="Confirming your new Marto account email address."
      badge="Account Security"
      icon={<MailCheck className="w-6 h-6" />}
    >
      <div className="space-y-5">
        {status === 'loading' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm font-medium text-on-surface">
              Verifying your new email address...
            </p>
            <p className="text-xs text-text-muted">
              Please wait while we validate your security token.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
              <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
              <h2 className="font-display font-semibold text-base text-on-surface">
                Email Address Updated
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">{message}</p>
            </div>

            {isAuthenticated && user ? (
              <div className="space-y-2.5">
                <Link
                  href={profileHref}
                  className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Go to Profile Settings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {user.role === 'SELLER' ? (
                  <Link
                    href="/seller/dashboard"
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    <span>Open Seller Console</span>
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/customer/login"
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Customer Sign In</span>
                </Link>
                <Link
                  href="/seller/login"
                  className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
                >
                  <Store className="w-4 h-4" />
                  <span>Seller Sign In</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div
              role="alert"
              className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2.5"
            >
              <AlertCircle className="w-9 h-9 text-status-danger mx-auto" />
              <h2 className="font-display font-semibold text-base text-on-surface">
                {statusCode === 409
                  ? 'Email Address Already Registered'
                  : 'Email Verification Failed'}
              </h2>
              <p className="text-sm text-rose-800 leading-relaxed">{message}</p>
            </div>

            <div className="space-y-2.5">
              {isAuthenticated && user ? (
                <Link
                  href={profileHref}
                  className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Request a New Verification Link</span>
                </Link>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/customer/login"
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Customer Sign In</span>
                  </Link>
                  <Link
                    href="/seller/login"
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    <span>Seller Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
