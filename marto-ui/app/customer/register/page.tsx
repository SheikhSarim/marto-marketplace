'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { customerRegisterSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

type FormValues = z.infer<typeof customerRegisterSchema>;

export default function CustomerRegisterPage() {
  const { customerRegister, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(customerRegisterSchema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const res = await customerRegister({
      full_name: values.full_name,
      email: values.email,
      password: values.password,
      phone: values.phone || undefined,
    });

    if (res.success) {
      setSuccessMessage(
        res.message ||
          'Account created! Please check your email inbox and click the verification link before signing in.'
      );
    } else {
      setServerError(res.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Shop verified Pakistani merchants with direct seller dispatch."
      badge="Customer Registration"
      icon={<UserPlus className="w-6 h-6" />}
      footer={
        <p>
          Already registered?{' '}
          <Link href="/customer/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {successMessage ? (
        <div className="space-y-5 text-center py-2">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
            <CheckCircle2 className="w-9 h-9 text-status-success mx-auto" />
            <h2 className="font-display font-semibold text-base text-on-surface">
              Check your inbox
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">{successMessage}</p>
          </div>
          <Link
            href="/customer/login"
            className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-full bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold transition-all"
          >
            <span>Go to Customer Sign In</span>
            <ArrowRight className="w-4 h-4" />
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
              <span className="leading-relaxed font-medium">{serverError}</span>
            </div>
          )}

          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-on-surface mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                className="pl-10"
                {...register('full_name')}
              />
            </div>
            {errors.full_name && (
              <p className="text-xs text-status-danger mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-on-surface mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reg-email"
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
            <label htmlFor="reg-phone" className="block text-sm font-medium text-on-surface mb-1.5">
              Phone Number <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+92 300 1234567"
                className="pl-10"
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-status-danger mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-on-surface mb-1.5">
              Password <span className="text-xs text-text-muted font-normal">(8–72 chars)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
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

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-on-surface mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-type your password"
                className="pl-10"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-status-danger mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" variant="pill" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
