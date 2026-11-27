'use client';

import React from 'react';
import { SellerPanelLayout } from '@/components/seller/SellerPanelLayout';
import { UserProfileManager } from '@/components/account/UserProfileManager';

export default function SellerSettingsPage() {
  return (
    <SellerPanelLayout
      title="Profile & Account Settings"
      subtitle="Manage your seller identity, avatar, and verified login email"
    >
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">
            Profile &amp; Account Settings
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Update your seller avatar, display name, and verified login email address.
          </p>
        </div>

        <UserProfileManager />
      </div>
    </SellerPanelLayout>
  );
}
