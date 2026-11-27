'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { UserProfileManager } from '@/components/account/UserProfileManager';

export default function CustomerProfilePage() {
  return (
    <RoleGuard allowedRoles={['CUSTOMER']} loginPath="/customer/login">
      <StorefrontShell>
        <div className="marto-container py-8 sm:py-10 space-y-6 max-w-5xl">
          <div className="space-y-2">
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Account</span>
            </Link>

            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface">
                Profile &amp; Account Security
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Update your profile photo, personal contact details, and verified login email address.
              </p>
            </div>
          </div>

          <UserProfileManager />
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
