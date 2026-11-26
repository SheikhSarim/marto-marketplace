import React from 'react';
import { Metadata } from 'next';
import { SellerLoginForm } from '@/components/seller/SellerLoginForm';

export const metadata: Metadata = {
  title: 'Seller Login - Marto Marketplace Operations',
  description: 'Merchant login portal for Marto Marketplace. Authenticate to manage shops, catalogs, orders, and revenue.',
};

export default function SellerLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative Radial Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-md z-10">
        <SellerLoginForm redirectTo="/seller/panel" />
      </div>
    </div>
  );
}
