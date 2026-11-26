'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPasswordSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Mail, AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotCustomerPassword } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    const res = await forgotCustomerPassword(values.email);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(
        res.message ||
          'If an account exists for that email address, a password reset link has been sent.'
      );
    } else {
      setServerError(res.message || 'Unable to send password reset email.');
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your registered email and we will send a secure reset link."
      badge="Password Recovery"
      icon={<KeyRound className="w-6 h-6" />}
      footer={
        <Link href="/customer/login" className="font-medium text-primary hover:underline">
          ← Return to Customer Sign In
        </Link>
      }
    >
      {successMessage ? (
        <div className="space-y-4 text-center py-2">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Reset link sent
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{successMessage}</p>
          </div>
          <Link
            href="/customer/login"
            className="inline-flex items-center justify-center w-full h-11 px-4 rounded-full border border-border-slate bg-surface-card hover:bg-surface-page text-sm font-semibold text-on-surface transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-on-surface mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="forgot-email"
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

          <Button type="submit" variant="pill" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Link...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
