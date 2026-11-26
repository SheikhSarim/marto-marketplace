import React from 'react';
import Link from 'next/link';
import { Mail, Store, ArrowRight } from 'lucide-react';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  return (
    <StorefrontShell>
      <div className="marto-container-narrow py-12 sm:py-16 space-y-8">
        <div className="space-y-3">
          <h1 className="font-display font-bold text-3xl text-on-surface">
            Support & Portal Links
          </h1>
          <p className="text-base text-text-muted">
            Select the appropriate portal below for customer inquiries, seller application tracking, or account assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-3">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-on-surface">
              Customer Accounts
            </h2>
            <p className="text-sm text-text-muted">
              Sign in to manage orders, resend email verification, or request a password reset link.
            </p>
            <Link href="/customer/login" className="inline-block pt-1">
              <Button variant="outline" size="sm" className="rounded-full">
                <span>Customer Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-3">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-on-surface">
              Merchant Applications
            </h2>
            <p className="text-sm text-text-muted">
              Check the review status of a submitted seller onboarding application using your business email.
            </p>
            <Link href="/sell/application-status" className="inline-block pt-1">
              <Button variant="outline" size="sm" className="rounded-full">
                <span>Check Application Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
