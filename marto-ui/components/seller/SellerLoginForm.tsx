'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sellerLoginSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowLeft,
  UserPlus,
  FileSearch,
  X,
} from 'lucide-react';

type FormValues = z.infer<typeof sellerLoginSchema>;

interface SellerLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function SellerLoginForm({
  onSuccess,
  redirectTo = '/seller/panel',
}: SellerLoginFormProps) {
  const router = useRouter();
  const {
    sellerLogin,
    isLoading,
    error,
    clearError,
    checkSession,
    user,
    isAuthenticated,
    hasCheckedSession,
    checkSellerStatus,
    verifyEmail,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusEmail, setStatusEmail] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const hasInitiatedRef = useRef(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(sellerLoginSchema),
  });

  useEffect(() => {
    if (!hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      if (!hasCheckedSession) checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'SELLER' || user.role === 'SUPER_ADMIN')) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, user, onSuccess, redirectTo, router]);

  const onSubmit = async (values: FormValues) => {
    clearError();
    setIsUnverified(false);
    setIsPending(false);
    setIsRejected(false);
    setVerifyMessage(null);

    const res = await sellerLogin(values);
    if (res.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } else {
      if (res.isUnverified) setIsUnverified(true);
      if (res.isPending) setIsPending(true);
      if (res.isRejected) setIsRejected(true);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken.trim()) return;
    setIsVerifying(true);
    const res = await verifyEmail(verificationToken.trim());
    setIsVerifying(false);
    if (res.success) {
      setVerifyMessage(res.message || 'Email verified. You can now sign in.');
      setIsUnverified(false);
      setVerificationToken('');
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusEmail.trim()) return;
    setStatusLoading(true);
    setStatusMsg(null);
    const res = await checkSellerStatus(statusEmail.trim());
    setStatusLoading(false);
    setStatusMsg(
      res.message ||
        'If this email is registered in our seller directory, we have sent a status update.'
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-surface-card border border-border-slate p-6 sm:p-8 shadow-[var(--shadow-level-2)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-on-surface tracking-tight">
                Seller Portal
              </h1>
              <p className="text-xs text-text-muted">Merchant Operations & Storefront Hub</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        {verifyMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
            <span>{verifyMessage}</span>
          </div>
        )}

        {isUnverified && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Email Verification Required</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Verify your email address using the link sent upon registration before signing in.
                </p>
              </div>
            </div>
            <form onSubmit={handleVerifyToken} className="flex gap-2">
              <Input
                type="text"
                placeholder="Paste email verification token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" disabled={isVerifying || !verificationToken.trim()}>
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
              </Button>
            </form>
          </div>
        )}

        {isPending && (
          <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-status-info shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Application Under Admin Review</p>
              <p className="text-blue-800 leading-relaxed">
                Seller accounts require Super Admin approval before store access is unlocked.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusEmail(getValues('email') || '');
                  setShowStatusModal(true);
                }}
                className="font-semibold text-primary hover:underline"
              >
                Check application status →
              </button>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Application Rejected</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {error && !isUnverified && !isPending && !isRejected && (
          <div
            className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="seller-email" className="block text-sm font-medium text-on-surface mb-1.5">
              Seller Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="seller-email"
                type="email"
                autoComplete="email"
                placeholder="merchant@business.pk"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-status-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="seller-password"
                className="block text-sm font-medium text-on-surface"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setStatusEmail(getValues('email') || '');
                  setShowStatusModal(true);
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Track application?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="seller-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-status-danger mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" variant="pill" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Seller Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted px-2">
        <Link
          href="/sell/register"
          className="text-primary font-semibold hover:underline flex items-center gap-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New merchant? Apply to sell</span>
        </Link>
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Application Status</span>
        </button>
      </div>

      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-midnight/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-surface-card border border-border-slate p-6 shadow-[var(--shadow-level-3)] space-y-4">
            <div className="flex items-center justify-between border-b border-border-slate pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold text-base text-on-surface">
                  Seller Application Status
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 text-text-muted hover:text-on-surface rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Enter your registered seller email address to request a status update.
            </p>

            <form onSubmit={handleCheckStatus} className="space-y-3">
              <Input
                type="email"
                required
                placeholder="merchant@business.pk"
                value={statusEmail}
                onChange={(e) => setStatusEmail(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={statusLoading || !statusEmail.trim()}>
                {statusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Status Update'}
              </Button>
            </form>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-surface-page border border-border-slate text-xs text-on-surface">
                {statusMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
