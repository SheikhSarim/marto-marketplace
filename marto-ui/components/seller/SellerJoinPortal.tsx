'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Store,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Loader2,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { sellerApplicationStatusSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SellerRegisterForm } from './SellerRegisterForm';

type StatusFormValues = z.infer<typeof sellerApplicationStatusSchema>;

interface SellerJoinPortalProps {
  defaultTab?: 'overview' | 'register' | 'status';
}

export function SellerJoinPortal({ defaultTab = 'overview' }: SellerJoinPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'status'>(defaultTab);
  const { checkSellerStatus } = useAuthStore();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(sellerApplicationStatusSchema),
    defaultValues: { email: '' },
  });

  const onCheckStatus = async (values: StatusFormValues) => {
    setStatusMessage(null);
    setStatusError(null);
    const res = await checkSellerStatus(values.email);
    if (res.success) {
      setStatusMessage(
        res.message || 'If this email exists in our records, we have sent an application status update.'
      );
    } else {
      setStatusError(res.message || 'Unable to verify status at this time.');
    }
  };

  return (
    <StorefrontShell>
      <div className="marto-container py-10 sm:py-12 space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-10 shadow-[var(--shadow-level-1)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Store className="w-3.5 h-3.5" />
              <span>Marto Merchant Onboarding</span>
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-4xl text-on-surface">
              Grow your independent business on Marto
            </h1>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Submit your business application, verify your email, and once approved by Marto governance, manage your shop, catalog, and fulfillment from one dedicated console.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link href="/seller/login">
              <Button variant="outline" className="rounded-full">
                <LogIn className="w-4 h-4 text-primary" />
                <span>Seller Sign In</span>
              </Button>
            </Link>
            <Button
              type="button"
              variant="pill"
              onClick={() => setActiveTab('register')}
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply Now</span>
            </Button>
          </div>
        </div>

        {/* Portal Mode Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-border-slate pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-card border border-border-slate text-on-surface hover:border-primary'
            }`}
          >
            Onboarding Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-card border border-border-slate text-on-surface hover:border-primary'
            }`}
          >
            Register New Shop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-card border border-border-slate text-on-surface hover:border-primary'
            }`}
          >
            Track Application Status
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border-slate bg-surface-card p-6 space-y-2 shadow-[var(--shadow-level-1)]">
              <span className="inline-flex w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-bold text-sm items-center justify-center">
                1
              </span>
              <h2 className="font-display font-semibold text-base text-on-surface">
                Submit Business KYC
              </h2>
              <p className="text-sm text-text-muted">
                Provide your CNIC, business address, primary shop category, and optional shop logo & cover banner.
              </p>
            </div>
            <div className="rounded-2xl border border-border-slate bg-surface-card p-6 space-y-2 shadow-[var(--shadow-level-1)]">
              <span className="inline-flex w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-bold text-sm items-center justify-center">
                2
              </span>
              <h2 className="font-display font-semibold text-base text-on-surface">
                Verify Email & Await Review
              </h2>
              <p className="text-sm text-text-muted">
                Confirm ownership via the emailed verification link. Super Admins approve verified applications cleanly.
              </p>
            </div>
            <div className="rounded-2xl border border-border-slate bg-surface-card p-6 space-y-2 shadow-[var(--shadow-level-1)]">
              <span className="inline-flex w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-bold text-sm items-center justify-center">
                3
              </span>
              <h2 className="font-display font-semibold text-base text-on-surface">
                Launch Catalog & Collections
              </h2>
              <p className="text-sm text-text-muted">
                Publish SKUs with PKR pricing, promotional sale windows, and up to 8 high-resolution product images.
              </p>
            </div>

            <div className="md:col-span-3 flex flex-wrap gap-3 pt-2">
              <Button variant="pill" onClick={() => setActiveTab('register')}>
                <span>Start Seller Application</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setActiveTab('status')}>
                <Search className="w-4 h-4" />
                <span>Check Existing Application</span>
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-10 shadow-[var(--shadow-level-1)]">
            <SellerRegisterForm />
          </div>
        )}

        {activeTab === 'status' && (
          <div className="max-w-xl rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-1)] space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-on-surface">
                  Request Application Status Update
                </h2>
                <p className="text-sm text-text-muted mt-0.5">
                  Enter the email address used during seller registration to receive your latest review status.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onCheckStatus)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface">Registered Email *</label>
                <Input {...register('email')} type="email" placeholder="owner@company.pk" />
                {errors.email && (
                  <p className="text-xs text-status-danger">{errors.email.message}</p>
                )}
              </div>

              {statusMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-status-success" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {statusError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-status-danger">
                  {statusError}
                </div>
              )}

              <Button type="submit" variant="pill" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Send Status Email</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
