"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Store,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { sellerRegisterSchema } from "@/lib/schemas";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useActiveShopCategories } from "@/hooks/queries/useMarketplaceQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SellerRegisterValues = z.infer<typeof sellerRegisterSchema>;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface SellerRegisterFormProps {
  onSuccess?: () => void;
}

export function SellerRegisterForm({ onSuccess }: SellerRegisterFormProps) {
  const { sellerRegister } = useAuthStore();
  const { data: categoriesRes, isLoading: categoriesLoading } =
    useActiveShopCategories();
  const shopCategories = categoriesRes?.data || [];

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SellerRegisterValues>({
    resolver: zodResolver(sellerRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      business_name: "",
      business_email: "",
      business_phone: "",
      cnic: "",
      business_address: "",
      city: "",
      shop_name: "",
      shop_description: "",
      shop_category: "",
      custom_category_name: "",
      delivery_information: "",
    },
  });

  const selectedCategory = watch("shop_category");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    setFileError(null);
    const file = e.target.files?.[0] || null;
    if (!file) {
      setter(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Images must be JPEG, PNG, or WebP format.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError("Each image file must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }
    setter(file);
  };

  const onSubmit = async (values: SellerRegisterValues) => {
    setServerError(null);
    setFileError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("business_name", values.business_name);
    formData.append("business_email", values.business_email);
    formData.append("business_phone", values.business_phone);
    formData.append("cnic", values.cnic);
    formData.append("business_address", values.business_address);
    formData.append("city", values.city);
    formData.append("shop_name", values.shop_name);
    formData.append("shop_description", values.shop_description);
    formData.append("shop_category", values.shop_category);
    if (
      values.shop_category === "other" &&
      values.custom_category_name?.trim()
    ) {
      formData.append(
        "custom_category_name",
        values.custom_category_name.trim(),
      );
    }
    formData.append("delivery_information", values.delivery_information);

    if (logoFile) formData.append("shop_logo", logoFile);
    if (coverFile) formData.append("shop_cover_image", coverFile);

    const res = await sellerRegister(formData);
    if (!res.success) {
      setServerError(res.message || "Could not submit application.");
      toast.error(res.message || "Seller registration failed.");
      return;
    }

    toast.success("Seller application submitted", {
      description: "Check your email inbox to verify your account.",
    });
    setSubmittedEmail(values.email);
    onSuccess?.();
  };

  if (submittedEmail) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-status-success flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-xl text-on-surface">
          Application Received
        </h2>
        <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          We sent an email verification link to{" "}
          <strong className="text-on-surface">{submittedEmail}</strong>. Please
          verify your email first, after which a Super Admin will review your
          business application.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-primary font-semibold">
          <Mail className="w-4 h-4" />
          <span>
            Email verification & admin approval required before sign-in
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {serverError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-2.5 text-sm text-status-danger">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {fileError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2.5 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Section 1: Owner Credentials */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-slate">
          <User className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-base text-on-surface">
            1. Owner Account Credentials
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Full Name *
            </label>
            <Input {...register("name")} placeholder="Owner legal name" />
            {errors.name && (
              <p className="text-xs text-status-danger">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Login Email *
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="owner@company.pk"
            />
            {errors.email && (
              <p className="text-xs text-status-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Password *
            </label>
            <Input
              {...register("password")}
              type="password"
              placeholder="Min 8 characters"
            />
            {errors.password && (
              <p className="text-xs text-status-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Confirm Password *
            </label>
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-status-danger">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Legal Business & KYC */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-slate">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-base text-on-surface">
            2. Business & Verification Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Registered Business Name *
            </label>
            <Input
              {...register("business_name")}
              placeholder="e.g. Indus Craft Traders"
            />
            {errors.business_name && (
              <p className="text-xs text-status-danger">
                {errors.business_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Business Email *
            </label>
            <Input
              {...register("business_email")}
              type="email"
              placeholder="sales@company.pk"
            />
            {errors.business_email && (
              <p className="text-xs text-status-danger">
                {errors.business_email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Business Phone *
            </label>
            <Input
              {...register("business_phone")}
              placeholder="+92 300 0000000"
            />
            {errors.business_phone && (
              <p className="text-xs text-status-danger">
                {errors.business_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              CNIC (13 digits) *
            </label>
            <Input {...register("cnic")} placeholder="42101-1234567-1" />
            {errors.cnic && (
              <p className="text-xs text-status-danger">
                {errors.cnic.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Dispatch City *
            </label>
            <Input
              {...register("city")}
              placeholder="Lahore, Karachi, Islamabad..."
            />
            {errors.city && (
              <p className="text-xs text-status-danger">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              Business Warehouse Address *
            </label>
            <Input
              {...register("business_address")}
              placeholder="Full commercial street address"
            />
            {errors.business_address && (
              <p className="text-xs text-status-danger">
                {errors.business_address.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Shop Profile & Media */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border-slate">
          <Store className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-base text-on-surface">
            3. Storefront Setup & Branding
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Public Shop Name *
            </label>
            <Input
              {...register("shop_name")}
              placeholder="Storefront display name"
            />
            {errors.shop_name && (
              <p className="text-xs text-status-danger">
                {errors.shop_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Primary Shop Category *
            </label>
            <select
              {...register("shop_category")}
              disabled={categoriesLoading}
              className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select category"}
              </option>
              {shopCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="other">Other (Specify Custom Category)</option>
            </select>
            {errors.shop_category && (
              <p className="text-xs text-status-danger">
                {errors.shop_category.message}
              </p>
            )}
          </div>

          {selectedCategory === "other" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-on-surface">
                Custom Category Name *
              </label>
              <Input
                {...register("custom_category_name")}
                placeholder="e.g. Artisanal Ceramics"
              />
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              Shop Description *
            </label>
            <textarea
              {...register("shop_description")}
              rows={3}
              placeholder="Describe your product range, craftsmanship, and return policy..."
              className="w-full rounded-lg border border-border-slate bg-surface-card px-3.5 py-2.5 text-sm text-on-surface placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container"
            />
            {errors.shop_description && (
              <p className="text-xs text-status-danger">
                {errors.shop_description.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              Delivery Coverage & Dispatch Terms *
            </label>
            <textarea
              {...register("delivery_information")}
              rows={2}
              placeholder="e.g. Same-day dispatch inside Lahore; 2-4 business days nationwide via courier."
              className="w-full rounded-lg border border-border-slate bg-surface-card px-3.5 py-2.5 text-sm text-on-surface placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-container/25 focus:border-primary-container"
            />
            {errors.delivery_information && (
              <p className="text-xs text-status-danger">
                {errors.delivery_information.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Shop Logo (Optional, JPEG/PNG/WebP ≤ 5MB)
            </label>
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-dashed border-border-slate bg-surface-page hover:border-primary cursor-pointer text-xs text-text-muted">
              <Upload className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">
                {logoFile ? logoFile.name : "Choose shop logo file..."}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, setLogoFile)}
                className="sr-only"
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Shop Cover Image (Optional, ≤ 5MB)
            </label>
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-dashed border-border-slate bg-surface-page hover:border-primary cursor-pointer text-xs text-text-muted">
              <Upload className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">
                {coverFile ? coverFile.name : "Choose shop cover image..."}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileChange(e, setCoverFile)}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="pt-2">
        <Button
          type="submit"
          variant="pill"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit Seller Application</span>
        </Button>
      </div>
    </form>
  );
}
