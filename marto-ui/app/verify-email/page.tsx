'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  KeyRound,
  ShoppingBag,
  Store,
  Send,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const { verifyEmail, resendCustomerVerification } = useAuthStore();

  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const handleVerify = useCallback(
    async (tok: string) => {
      if (!tok.trim()) return;
      setStatus('loading');
      setMessage(null);
      const res = await verifyEmail(tok.trim());
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(res.message || 'Verification token is invalid or has expired.');
      }
    },
    [verifyEmail]
  );

  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
  }, [initialToken, handleVerify]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    const res = await resendCustomerVerification(resendEmail.trim());
    setResending(false);
    setResendFeedback(
      res.message || 'If your email is registered, a fresh verification link has been sent.'
    );
  };

  return (
    <AuthShell
      title="Email verification"
      subtitle="Confirm your email address to activate your Marto account."
      badge="Account Activation"
      icon={<Mail className="w-6 h-6" />}
    >
      <div className="space-y-5">
        {status === 'loading' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary mx-auto" />
            <p className="text-sm text-text-muted">Verifying your email link...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-9 h-9 text-status-success mx-auto" />
              <h2 className="font-display font-semibold text-base text-on-surface">
                Email Verified
              </h2>
              <p className="text-sm text-text-muted">{message}</p>
            </div>
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
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <AlertCircle className="w-7 h-7 text-status-danger mx-auto" />
              <h2 className="font-display font-semibold text-sm text-on-surface">
                Verification Failed
              </h2>
              <p className="text-xs text-rose-800">{message}</p>
            </div>

            <form onSubmit={handleResend} className="p-4 rounded-2xl bg-surface-page border border-border-slate space-y-3">
              <p className="text-xs font-semibold text-on-surface">
                Request a new customer verification email
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10"
                />
                <Button type="submit" size="sm" disabled={resending} className="h-10 shrink-0">
                  {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </Button>
              </div>
              {resendFeedback && (
                <p className="text-xs text-primary font-medium">{resendFeedback}</p>
              )}
            </form>
          </div>
        )}

        {status !== 'loading' && status !== 'success' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(token);
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor="verify-token" className="block text-sm font-medium text-on-surface mb-1.5">
                Verification Token
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="verify-token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste verification token"
                  className="pl-10 font-mono"
                />
              </div>
            </div>
            <Button type="submit" variant="pill" className="w-full">
              Verify Email Address
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function UniversalVerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
