'use client';

import React from 'react';
import Link from 'next/link';
import { User, MapPin, Package, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { StorefrontShell } from '@/components/storefront/StorefrontShell';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/ui/SafeImage';

export default function CustomerAccountPage() {
  const { user } = useAuthStore();

  const cards = [
    {
      title: 'Profile & Security',
      description: 'Update your profile photo, name, phone number, and verified email.',
      href: '/account/profile',
      icon: User,
    },
    {
      title: 'Delivery Addresses',
      description: 'Manage your saved Pakistani shipping addresses.',
      href: '/account/addresses',
      icon: MapPin,
    },
    {
      title: 'Order History',
      description: 'Track single-seller shipments and delivery milestones.',
      href: '/account/orders',
      icon: Package,
    },
    {
      title: 'Shopping Bag',
      description: 'Review items currently staged in your active seller bag.',
      href: '/cart',
      icon: ShoppingBag,
    },
  ];

  return (
    <RoleGuard allowedRoles={['CUSTOMER']} loginPath="/customer/login">
      <StorefrontShell>
        <div className="marto-container py-8 sm:py-10 space-y-6">
          <div className="rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-display font-bold text-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                {user?.avatarUrl ? (
                  <SafeImage src={user.avatarUrl} alt={user.name} fill sizes="56px" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase() || 'C'}</span>
                )}
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-on-surface">
                  {user?.name || 'Customer Account'}
                </h1>
                <p className="text-sm text-text-muted">{user?.email}</p>
              </div>
            </div>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'} size="md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.emailVerified ? 'Verified Customer' : 'Verification Pending'}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] hover:border-primary/40 transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-surface-container-low border border-border-slate text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display font-semibold text-base text-on-surface group-hover:text-primary transition-colors">
                        {card.title}
                      </h2>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-text-muted mt-1">{card.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </StorefrontShell>
    </RoleGuard>
  );
}
