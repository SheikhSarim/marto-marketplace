"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Store, Upload, Loader2, Save, Power } from "lucide-react";

import {
  useMyShop,
  useActiveShopCategories,
  useUpdateMyShop,
  useUpdateMyShopImages,
  useUpdateMyShopStatus,
} from "@/hooks/queries/useMarketplaceQueries";

import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function MyShopManager() {
  const { data: shopRes, isLoading, error, refetch } = useMyShop();
  const { data: catsRes } = useActiveShopCategories();

  const updateShop = useUpdateMyShop();
  const updateImages = useUpdateMyShopImages();
  const updateStatus = useUpdateMyShopStatus();

  const shop = shopRes?.data;
  const shopCategories = catsRes?.data || [];

  const coverImageUrl = shop?.cover_image_url;

  const logoImageUrl = shop?.logo_url || shop?.logo || undefined;

  useEffect(() => {
    if (!shop) return;
  }, [shopRes, shop, coverImageUrl, logoImageUrl]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shopCategoryId, setShopCategoryId] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    if (!shop) return;

    setName(shop.name || "");
    setDescription(shop.description || "");
    setShopCategoryId(shop.shop_category_id || "");
    setCustomCategoryName(shop.custom_category_name || "");
    setCity(shop.city || "");
    setAddress(shop.address || "");
    setContactPhone(shop.contact_phone || shop.contactPhone || "");
    setContactEmail(shop.contact_email || shop.contactEmail || "");
    setDeliveryInfo(shop.delivery_information || shop.deliveryInfo || "");
  }, [shop]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateShop.mutateAsync({
        name: name.trim(),
        description: description.trim(),

        ...(shopCategoryId && shopCategoryId !== "other"
          ? { shop_category_id: shopCategoryId }
          : {}),

        ...(shopCategoryId === "other" && customCategoryName.trim()
          ? { custom_category_name: customCategoryName.trim() }
          : {}),

        city: city.trim(),
        address: address.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        delivery_information: deliveryInfo.trim(),
      });

      await refetch();

      toast.success("Shop profile updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update shop profile.",
      );
    }
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "shop_logo" | "shop_cover_image",
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const fd = new FormData();
    fd.append(field, file);

    try {
      await updateImages.mutateAsync(fd);

      await refetch();

      toast.success(
        field === "shop_cover_image"
          ? "Shop cover image updated"
          : "Shop logo updated",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image.",
      );
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!shop) return;

    const nextStatus = shop.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateStatus.mutateAsync(nextStatus);
      await refetch();

      toast.success(`Shop status changed to ${nextStatus}`);
      setStatusDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update shop status.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 rounded-3xl bg-surface-card border border-border-slate" />
        <div className="h-96 rounded-3xl bg-surface-card border border-border-slate" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Could not load your merchant shop."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const canSellerToggle =
    shop.status === "ACTIVE" || shop.status === "INACTIVE";

  return (
    <div className="space-y-6">
      {/* Header & Shop Cover */}
      <div className="rounded-3xl border border-border-slate bg-surface-card overflow-hidden shadow-[var(--shadow-level-1)]">
        <div className="relative h-40 sm:h-52 w-full bg-surface-container-low border-b border-border-slate">
          {coverImageUrl ? (
            <SafeImage
              key={coverImageUrl}
              src={coverImageUrl}
              alt={`${shop.name} cover`}
              fill
              sizes="1200px"
              fallbackIcon={<Store className="w-10 h-10 opacity-30" />}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Store className="w-10 h-10 text-text-muted opacity-40" />
              <span className="sr-only">No cover image available</span>
            </div>
          )}

          <label className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-card/95 border border-border-slate text-xs font-semibold text-on-surface hover:border-primary cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>
              {updateImages.isPending ? "Uploading..." : "Change Cover"}
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={updateImages.isPending}
              onChange={(e) => handleUploadImage(e, "shop_cover_image")}
              className="sr-only"
            />
          </label>
        </div>

        {/* Shop Information */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl border border-border-slate bg-surface-page overflow-hidden shrink-0">
              {logoImageUrl ? (
                <SafeImage
                  key={logoImageUrl}
                  src={logoImageUrl}
                  alt={shop.name}
                  fill
                  sizes="64px"
                  fallbackIcon={<Store className="w-6 h-6 opacity-40" />}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-text-muted opacity-40" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display font-bold text-xl text-on-surface">
                  {shop.name}
                </h1>

                <StatusBadge status={shop.status} />
              </div>

              <p className="text-xs text-text-muted mt-1">
                {shop.city || "Dispatch city not set"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border-slate bg-surface-page hover:border-primary text-xs font-semibold text-on-surface cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-primary" />

              <span>Upload Logo</span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={updateImages.isPending}
                onChange={(e) => handleUploadImage(e, "shop_logo")}
                className="sr-only"
              />
            </label>

            {canSellerToggle && (
              <Button
                type="button"
                variant={shop.status === "ACTIVE" ? "outline" : "pill"}
                size="sm"
                className="rounded-full"
                onClick={() => setStatusDialogOpen(true)}
              >
                <Power className="w-3.5 h-3.5" />

                <span>
                  {shop.status === "ACTIVE" ? "Set Inactive" : "Activate Shop"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Shop Settings Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-3xl border border-border-slate bg-surface-card p-6 sm:p-8 shadow-[var(--shadow-level-1)] space-y-5"
      >
        <h2 className="font-display font-bold text-lg text-on-surface">
          Storefront Details & Delivery Terms
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Shop Name *
            </label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Shop Category
            </label>

            <select
              value={shopCategoryId}
              onChange={(e) => setShopCategoryId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-border-slate bg-surface-card text-sm text-on-surface focus:outline-none focus:border-primary-container"
            >
              <option value="">Select category</option>

              {shopCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}

              <option value="other">Custom Category</option>
            </select>
          </div>

          {shopCategoryId === "other" && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-on-surface">
                Custom Category Name
              </label>

              <Input
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Contact Email
            </label>

            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Contact Phone
            </label>

            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              City
            </label>

            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface">
              Address
            </label>

            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border-slate bg-surface-card px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-on-surface">
              Delivery Information
            </label>

            <textarea
              rows={2}
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              className="w-full rounded-lg border border-border-slate bg-surface-card px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" variant="pill" disabled={updateShop.isPending}>
            {updateShop.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}

            <span>Save Changes</span>
          </Button>
        </div>
      </form>

      {/* Shop Status Confirmation */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        title={
          shop.status === "ACTIVE"
            ? "Deactivate Storefront?"
            : "Activate Storefront?"
        }
        description={
          shop.status === "ACTIVE"
            ? "Setting your shop INACTIVE pauses public visibility of your storefront until you activate it again."
            : "Activating your shop makes your active catalog visible to shoppers on Marto."
        }
        confirmLabel={shop.status === "ACTIVE" ? "Set Inactive" : "Activate"}
        variant={shop.status === "ACTIVE" ? "destructive" : "default"}
        isLoading={updateStatus.isPending}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
}
