'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminLoginSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Store,
} from 'lucide-react';

type FormValues = z.infer<typeof adminLoginSchema>;

interface AdminLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function AdminLoginForm({ onSuccess, redirectTo = '/admin' }: AdminLoginFormProps) {
  const router = useRouter();
  const {
    adminLogin,
    isLoading,
    error,
    clearError,
    checkSession,
    user,
    isAuthenticated,
    hasCheckedSession,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const hasInitiatedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    if (!hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      if (!hasCheckedSession) checkSession();
    }
  }, [hasCheckedSession, checkSession]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
      if (onSuccess) {
        onSuccess();
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, user, onSuccess, redirectTo, router]);

  const onSubmit = async (values: FormValues) => {
    clearError();
    const res = await adminLogin(values);
    if (res.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-surface-card border border-border-slate p-6 sm:p-8 shadow-[var(--shadow-level-2)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-surface-midnight text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-secondary-container" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-on-surface tracking-tight">
                Super Admin Governance
              </h1>
              <p className="text-xs text-text-muted">Marto Marketplace Control Plane</p>
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

        {error && (
          <div
            className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-on-surface mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@marto-online.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-status-danger mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-on-surface mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter administrator password"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-text-muted px-2">
        <Link href="/seller/login" className="hover:text-primary transition-colors flex items-center gap-1">
          <Store className="w-3.5 h-3.5" />
          <span>Seller Portal</span>
        </Link>
        <Link href="/" className="hover:text-primary transition-colors">
          Return to Marketplace
        </Link>
      </div>
    </div>
  );
}
