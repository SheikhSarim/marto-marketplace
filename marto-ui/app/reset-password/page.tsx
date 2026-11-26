'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPasswordSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
} from 'lucide-react';

type FormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetCustomerPassword } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordVal = watch('password');
  const confirmVal = watch('confirmPassword');
  const isLengthValid = passwordVal.length >= 8 && passwordVal.length <= 72;
  const doPasswordsMatch = passwordVal.length > 0 && passwordVal === confirmVal;

  if (!token) {
    return (
      <AuthShell
        title="Missing reset token"
        subtitle="Open the complete password reset link from your email inbox."
        badge="Password Reset"
        icon={<AlertCircle className="w-6 h-6" />}
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-text-muted leading-relaxed">
            No reset token was found in this URL. Request a new password reset link to proceed.
          </p>
          <Link
            href="/customer/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
          >
            <span>Request Password Reset Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    // Submits strictly { token, password } to POST /api/v1/auth/customer/reset-password
    const res = await resetCustomerPassword({
      token,
      password: values.password,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Customer password reset successfully.');
    } else {
      setErrorMessage(res.message || 'Invalid or expired password reset token.');
    }
  };

  return (
    <AuthShell
      title="Set new password"
      subtitle="Enter your new password below to complete your account recovery."
      badge="Password Reset"
      icon={<Lock className="w-6 h-6" />}
      footer={
        <Link href="/customer/login" className="font-medium text-primary hover:underline">
          ← Back to Customer Sign In
        </Link>
      }
    >
      {successMessage ? (
        <div className="space-y-5 text-center py-2">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <CheckCircle2 className="w-9 h-9 text-status-success mx-auto" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Password Reset Complete
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{successMessage}</p>
          </div>
          <Link
            href="/customer/login"
            className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
          >
            <span>Sign In to Customer Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
              <Link
                href="/customer/forgot-password"
                className="inline-block font-semibold text-primary hover:underline"
              >
                Request a fresh reset link →
              </Link>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="reset-password" className="text-sm font-medium text-on-surface">
                New Password
              </label>
              <span className="text-xs text-text-muted">8–72 characters</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter new strong password"
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

          <div>
            <label htmlFor="reset-confirm" className="block text-sm font-medium text-on-surface mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reset-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-type new password"
                className="pl-10 pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-status-danger mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface-page border border-border-slate space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isLengthValid
                    ? 'bg-status-success text-white'
                    : 'bg-border-slate text-text-muted'
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className={isLengthValid ? 'text-on-surface font-medium' : 'text-text-muted'}>
                Between 8 and 72 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  doPasswordsMatch
                    ? 'bg-status-success text-white'
                    : 'bg-border-slate text-text-muted'
                }`}
              >
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className={doPasswordsMatch ? 'text-on-surface font-medium' : 'text-text-muted'}>
                Passwords match
              </span>
            </div>
          </div>

          <Button type="submit" variant="pill" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-page flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
