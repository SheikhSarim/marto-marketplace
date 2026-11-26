'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerLoginSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Send,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

type FormValues = z.infer<typeof customerLoginSchema>;

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from') || '/';

  const {
    customerLogin,
    resendCustomerVerification,
    user,
    isAuthenticated,
    isLoading,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(customerLoginSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      router.replace(fromParam);
    }
  }, [isAuthenticated, user, fromParam, router]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsUnverified(false);
    setResendSuccess(null);

    const res = await customerLogin(values);
    if (res.success) {
      router.push(fromParam);
    } else {
      setServerError(res.message || 'Unable to sign in with those credentials.');
      if (res.isUnverified) setIsUnverified(true);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues('email');
    if (!email) return;
    setResending(true);
    const res = await resendCustomerVerification(email);
    setResending(false);
    if (res.success) {
      setResendSuccess(res.message || 'Verification email sent. Check your inbox.');
    } else {
      setServerError(res.message || 'Could not resend verification email.');
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders, manage delivery addresses, and checkout faster."
      badge="Customer Account"
      icon={<ShoppingBag className="w-6 h-6" />}
      footer={
        <div className="space-y-2">
          <p>
            New to Marto?{' '}
            <Link
              href="/customer/register"
              className="font-semibold text-primary hover:underline"
            >
              Create a customer account
            </Link>
          </p>
          <p className="text-xs">
            Selling on Marto?{' '}
            <Link href="/seller/login" className="font-medium text-on-surface hover:underline">
              Merchant Sign In
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{serverError}</span>
            </div>
            {isUnverified && (
              <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2">
                <span>Need a new verification link?</span>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendVerification}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  {resending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Email</span>
                </button>
              </div>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
            <span>{resendSuccess}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="customer-email"
            className="block text-sm font-medium text-on-surface mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              id="customer-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
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
              htmlFor="customer-password"
              className="block text-sm font-medium text-on-surface"
            >
              Password
            </label>
            <Link
              href="/customer/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              id="customer-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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

        <Button
          type="submit"
          variant="pill"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      }
    >
      <CustomerLoginContent />
    </Suspense>
  );
}
