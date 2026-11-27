'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Camera,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Store,
  Save,
  Send,
  KeyRound,
  Check,
} from 'lucide-react';
import {
  useMyProfile,
  useUpdateMyProfile,
  useUpdateMyAvatar,
  useRequestEmailChange,
  useChangePassword,
} from '@/hooks/queries/useMarketplaceQueries';
import { validateAvatarFile } from '@/services/user.service';
import {
  updateProfileSchema,
  requestEmailChangeSchema,
  changePasswordSchema,
} from '@/lib/schemas';
import { formatDate } from '@/lib/format';
import { SafeImage } from '@/components/ui/SafeImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/ui/ErrorState';

type ProfileFormValues = z.infer<typeof updateProfileSchema>;
type EmailChangeFormValues = z.infer<typeof requestEmailChangeSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-border-slate bg-surface-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-surface-container-low shrink-0" />
        <div className="space-y-2.5 flex-1 w-full">
          <div className="h-5 w-48 rounded bg-surface-container" />
          <div className="h-4 w-64 rounded bg-surface-container-low" />
          <div className="flex gap-2 pt-1">
            <div className="h-6 w-24 rounded-full bg-surface-container-low" />
            <div className="h-6 w-28 rounded-full bg-surface-container-low" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border-slate bg-surface-card p-6 space-y-4">
          <div className="h-5 w-40 rounded bg-surface-container" />
          <div className="h-11 w-full rounded-lg bg-surface-container-low" />
          <div className="h-11 w-full rounded-lg bg-surface-container-low" />
          <div className="h-11 w-36 rounded-full bg-surface-container-low" />
        </div>
        <div className="rounded-2xl border border-border-slate bg-surface-card p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-surface-container" />
          <div className="h-11 w-full rounded-lg bg-surface-container-low" />
          <div className="h-11 w-full rounded-lg bg-surface-container-low" />
          <div className="h-11 w-44 rounded-full bg-surface-container-low" />
        </div>
      </div>
    </div>
  );
}

export function UserProfileManager() {
  const { data, isLoading, isError, error, refetch } = useMyProfile(true);
  const updateProfile = useUpdateMyProfile();
  const updateAvatar = useUpdateMyAvatar();
  const requestEmailChange = useRequestEmailChange();
  const changePassword = useChangePassword();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);

  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);

  const profile = data?.profile;
  const isCustomer = profile?.role === 'CUSTOMER';
  const isSeller = profile?.role === 'SELLER';

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmailForm,
    setError: setEmailFieldError,
    formState: { errors: emailErrors },
  } = useForm<EmailChangeFormValues>({
    resolver: zodResolver(requestEmailChangeSchema),
    defaultValues: {
      current_password: '',
      new_email: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const watchedCurrentPwd = watchPassword('current_password');
  const watchedNewPwd = watchPassword('new_password');
  const watchedConfirmPwd = watchPassword('confirm_new_password');
  const isPwdLengthValid = watchedNewPwd.length >= 8 && watchedNewPwd.length <= 72;
  const isPwdDifferent =
    watchedNewPwd.length > 0 && watchedCurrentPwd !== watchedNewPwd;
  const doNewPwdsMatch =
    watchedNewPwd.length > 0 && watchedNewPwd === watchedConfirmPwd;

  useEffect(() => {
    if (profile) {
      resetProfileForm({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, resetProfileForm]);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !profile) {
    return (
      <ErrorState
        title="Unable to load your profile"
        message={
          error instanceof Error
            ? error.message
            : 'Could not retrieve your personal profile details from the Marto API.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const handleAvatarSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setAvatarError(null);
    const validationErr = validateAvatarFile(file);
    if (validationErr) {
      setAvatarError(validationErr);
      toast.error(validationErr);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const res = await updateAvatar.mutateAsync(file);
      toast.success(res.message || 'Profile picture updated successfully.');
      setAvatarPreview(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload profile picture.';
      setAvatarError(msg);
      setAvatarPreview(null);
      toast.error(msg);
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const onSaveProfile = async (values: ProfileFormValues) => {
    try {
      const payload = isCustomer
        ? {
            name: values.name,
            ...(values.phone?.trim() ? { phone: values.phone.trim() } : {}),
          }
        : { name: values.name };

      await updateProfile.mutateAsync(payload);
      toast.success('Profile details updated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      toast.error(msg);
    }
  };

  const onRequestEmailChange = async (values: EmailChangeFormValues) => {
    setEmailChangeError(null);
    setEmailChangeSuccess(null);

    if (values.new_email.trim().toLowerCase() === profile.email.trim().toLowerCase()) {
      setEmailFieldError('new_email', {
        type: 'validate',
        message: 'New email address must be different from your current email.',
      });
      return;
    }

    try {
      const res = (await requestEmailChange.mutateAsync({
        current_password: values.current_password,
        new_email: values.new_email.trim(),
      })) as Record<string, unknown>;

      const serverMsg =
        typeof res?.message === 'string'
          ? res.message
          : 'Verification email sent successfully.';
      setEmailChangeSuccess(
        `${serverMsg} Check ${values.new_email.trim()} and open the confirmation link to switch your account email.`
      );
      resetEmailForm({ current_password: '', new_email: '' });
      toast.success(serverMsg);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to send email change verification.';
      setEmailChangeError(msg);
      toast.error(msg);
    }
  };

  const onChangePassword = async (values: ChangePasswordFormValues) => {
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    try {
      const res = (await changePassword.mutateAsync({
        current_password: values.current_password,
        new_password: values.new_password,
      })) as Record<string, unknown>;

      const serverMsg =
        typeof res?.message === 'string'
          ? res.message
          : 'Password changed successfully.';
      setPasswordChangeSuccess(serverMsg);
      resetPasswordForm({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      });
      toast.success(serverMsg);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to change password.';
      setPasswordChangeError(msg);
      toast.error(msg);
    }
  };

  const activeAvatarSrc = avatarPreview || profile.profile_pic || undefined;
  const initials = (profile.name || 'M')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Identity & Avatar Summary Card */}
      <section className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl border border-border-slate bg-surface-container-low overflow-hidden relative flex items-center justify-center">
                <SafeImage
                  key={activeAvatarSrc || 'avatar-fallback'}
                  src={activeAvatarSrc}
                  alt={profile.name}
                  fill
                  sizes="80px"
                  fallbackIcon={
                    <span className="font-display font-bold text-xl text-primary">
                      {initials || <User className="w-7 h-7" />}
                    </span>
                  }
                />
                {updateAvatar.isPending && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={updateAvatar.isPending}
                aria-label="Upload new profile picture"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-container hover:bg-primary text-on-primary shadow-[var(--shadow-level-2)] flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelection}
              />
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display font-bold text-xl text-on-surface truncate">
                  {profile.name}
                </h2>
                <Badge variant={isSeller ? 'success' : 'default'} size="sm" className="uppercase">
                  {profile.role}
                </Badge>
                {profile.status && <StatusBadge status={profile.status} size="sm" />}
              </div>

              <p className="text-sm text-text-muted break-all">{profile.email}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    className={`w-3.5 h-3.5 ${
                      profile.is_email_verified ? 'text-status-success' : 'text-accent-amber'
                    }`}
                  />
                  <span className="font-medium text-on-surface-variant">
                    {profile.is_email_verified ? 'Verified Email' : 'Email Unverified'}
                  </span>
                </span>

                {profile.createdAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={updateAvatar.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {updateAvatar.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </>
              )}
            </Button>
            <span className="text-[11px] text-text-muted">
              JPEG, PNG, or WebP &bull; Max 5 MB
            </span>
          </div>
        </div>

        {avatarError && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-status-danger shrink-0" />
            <span>{avatarError}</span>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Personal Information Form */}
        <section className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-5">
          <div>
            <h3 className="font-display font-semibold text-lg text-on-surface">
              Personal Information
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Update your account display details. Changes reflect immediately across Marto.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit(onSaveProfile)} className="space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-on-surface mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  className="pl-10"
                  {...registerProfile('name')}
                />
              </div>
              {profileErrors.name && (
                <p className="text-xs text-status-danger mt-1">{profileErrors.name.message}</p>
              )}
            </div>

            {isCustomer ? (
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+923001234567"
                    className="pl-10"
                    {...registerProfile('phone')}
                  />
                </div>
                {profileErrors.phone && (
                  <p className="text-xs text-status-danger mt-1">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-surface-page border border-border-slate text-xs text-text-muted flex items-start gap-2.5">
                <Store className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-on-surface">Business Contact Details</p>
                  <p className="mt-0.5 leading-relaxed">
                    Seller storefront phone numbers, opening hours, and delivery details are managed in{' '}
                    <Link href="/seller/shop" className="text-primary font-semibold hover:underline">
                      My Shop
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between gap-3">
              {profile.updatedAt && (
                <span className="text-[11px] text-text-muted">
                  Last updated {formatDate(profile.updatedAt)}
                </span>
              )}
              <Button
                type="submit"
                variant="pill"
                disabled={updateProfile.isPending || !isProfileDirty}
                className="ml-auto"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        {/* Email Address & Verification Card */}
        <section className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-5">
          <div>
            <h3 className="font-display font-semibold text-lg text-on-surface">
              Email Address Change
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Verify your current password to send a confirmation link to your new email address.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-page border border-border-slate flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Current Login Email
              </span>
              <span className="block text-sm font-medium text-on-surface truncate mt-0.5">
                {profile.email}
              </span>
            </div>
            <Badge variant={profile.is_email_verified ? 'success' : 'warning'} size="sm">
              {profile.is_email_verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          {emailChangeSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Confirmation Link Sent</p>
                <p className="leading-relaxed">{emailChangeSuccess}</p>
              </div>
            </div>
          )}

          {emailChangeError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
              <span className="leading-relaxed">{emailChangeError}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit(onRequestEmailChange)} className="space-y-4">
            <div>
              <label
                htmlFor="change-new-email"
                className="block text-sm font-medium text-on-surface mb-1.5"
              >
                New Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="change-new-email"
                  type="email"
                  autoComplete="email"
                  placeholder="newemail@example.com"
                  className="pl-10"
                  {...registerEmail('new_email')}
                />
              </div>
              {emailErrors.new_email && (
                <p className="text-xs text-status-danger mt-1">{emailErrors.new_email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="change-current-password"
                className="block text-sm font-medium text-on-surface mb-1.5"
              >
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="change-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Confirm your current password"
                  className="pl-10 pr-10"
                  {...registerEmail('current_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface cursor-pointer"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {emailErrors.current_password && (
                <p className="text-xs text-status-danger mt-1">
                  {emailErrors.current_password.message}
                </p>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <Button
                type="submit"
                variant="pill"
                disabled={requestEmailChange.isPending}
              >
                {requestEmailChange.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Verification Email</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>
      </div>

      {/* Password Change Section (Customer & Seller accounts) */}
      {(isCustomer || isSeller) && (
        <section className="rounded-2xl border border-border-slate bg-surface-card p-6 shadow-[var(--shadow-level-1)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-lg text-on-surface">
                Change Password
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Verify your current password and set a new password (8&ndash;72 characters).
              </p>
            </div>
            <Badge variant="secondary" size="sm">
              <KeyRound className="w-3 h-3" />
              <span>Account Security</span>
            </Badge>
          </div>

          {passwordChangeSuccess && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">Password Updated</p>
                <p className="leading-relaxed">{passwordChangeSuccess}</p>
              </div>
            </div>
          )}

          {passwordChangeError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-status-danger shrink-0 mt-0.5" />
              <span className="leading-relaxed">{passwordChangeError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="pwd-current"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="pwd-current"
                    type={showPwdCurrent ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    className="pl-10 pr-10"
                    {...registerPassword('current_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdCurrent((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface cursor-pointer"
                    aria-label={showPwdCurrent ? 'Hide current password' : 'Show current password'}
                  >
                    {showPwdCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-xs text-status-danger mt-1">
                    {passwordErrors.current_password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pwd-new"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="pwd-new"
                    type={showPwdNew ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="8–72 characters"
                    className="pl-10 pr-10"
                    {...registerPassword('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdNew((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface cursor-pointer"
                    aria-label={showPwdNew ? 'Hide new password' : 'Show new password'}
                  >
                    {showPwdNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="text-xs text-status-danger mt-1">
                    {passwordErrors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pwd-confirm"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="pwd-confirm"
                    type={showPwdConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-type new password"
                    className="pl-10 pr-10"
                    {...registerPassword('confirm_new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-on-surface cursor-pointer"
                    aria-label={
                      showPwdConfirm ? 'Hide confirm password' : 'Show confirm password'
                    }
                  >
                    {showPwdConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirm_new_password && (
                  <p className="text-xs text-status-danger mt-1">
                    {passwordErrors.confirm_new_password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-page border border-border-slate flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isPwdLengthValid
                      ? 'bg-status-success text-white'
                      : 'bg-border-slate text-text-muted'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span
                  className={isPwdLengthValid ? 'text-on-surface font-medium' : 'text-text-muted'}
                >
                  Between 8 and 72 characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isPwdDifferent
                      ? 'bg-status-success text-white'
                      : 'bg-border-slate text-text-muted'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span
                  className={isPwdDifferent ? 'text-on-surface font-medium' : 'text-text-muted'}
                >
                  Different from current password
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    doNewPwdsMatch
                      ? 'bg-status-success text-white'
                      : 'bg-border-slate text-text-muted'
                  }`}
                >
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span
                  className={doNewPwdsMatch ? 'text-on-surface font-medium' : 'text-text-muted'}
                >
                  Passwords match
                </span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <Button
                type="submit"
                variant="pill"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}