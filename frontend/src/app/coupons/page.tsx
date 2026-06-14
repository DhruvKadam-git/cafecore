"use client";

import React, { useState } from "react";
import {
  CouponFormData,
  MarketingTab,
  Promotion,
  PromotionFormData,
} from "@/lib/marketing-types";
import { MarketingToolbar } from "@/features/marketing/components/MarketingToolbar";
import { CouponsTable } from "@/features/marketing/components/CouponsTable";
import { PromotionsTable } from "@/features/marketing/components/PromotionsTable";
import { CouponModal } from "@/features/marketing/components/CouponModal";
import { PromotionModal } from "@/features/marketing/components/PromotionModal";
import { useAsyncData } from "@/hooks/use-async-data";
import { useToast } from "@/components/toast/use-toast";
import { toastApiError } from "@/components/toast/toast-utils";
import { buildCouponPayload, buildPromotionPayload, mapCouponToUI, mapPromotionToUI, marketingApi, productsApi } from "@/lib/api";

export default function CouponsPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const [coupons, promotions, products] = await Promise.all([
        marketingApi.getCoupons(),
        marketingApi.getPromotions(),
        productsApi.getProducts(),
      ]);
      return {
        coupons: coupons.map(mapCouponToUI),
        promotions: promotions.map(mapPromotionToUI),
        products: products.map((p) => ({ id: p.id, name: p.name })),
      };
    },
    [],
    { toastOnError: true }
  );

  const coupons = data?.coupons ?? [];
  const promotions = data?.promotions ?? [];
  const products = data?.products ?? [];

  const [activeTab, setActiveTab] = useState<MarketingTab>("coupons");
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleActive = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    try {
      await marketingApi.updateCoupon(id, { isActive: !coupon.active });
      toast.success(`Coupon "${coupon.code}" ${coupon.active ? "deactivated" : "activated"}`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await marketingApi.deleteCoupon(id);
      toast.success(`Coupon "${coupon?.code ?? id}" deleted`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    const promo = promotions.find((p) => p.id === id);
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await marketingApi.deletePromotion(id);
      toast.success(`Promotion "${promo?.name ?? id}" deleted`);
      reload();
    } catch (err) {
      toastApiError(toast, err);
    }
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setPromotionModalOpen(true);
  };

  const handleNewClick = () => {
    if (activeTab === "coupons") {
      setCouponModalOpen(true);
    } else {
      setEditingPromotion(null);
      setPromotionModalOpen(true);
    }
  };

  const handleClosePromotionModal = () => {
    setPromotionModalOpen(false);
    setEditingPromotion(null);
  };

  const handleSaveCoupon = async (data: CouponFormData) => {
    setSaving(true);
    try {
      const payload = buildCouponPayload(data);
      if (data.id) {
        await marketingApi.updateCoupon(data.id, payload);
        toast.success(`Coupon "${data.code}" updated`);
      } else {
        await marketingApi.createCoupon(payload);
        toast.success(`Coupon "${data.code}" created`);
      }
      setCouponModalOpen(false);
      reload();
    } catch (err) {
      toastApiError(toast, err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSavePromotion = async (data: PromotionFormData) => {
    setSaving(true);
    try {
      const payload = buildPromotionPayload(data);
      if (data.id) {
        await marketingApi.updatePromotion(data.id, payload);
        toast.success(`Promotion "${data.name}" updated`);
      } else {
        await marketingApi.createPromotion(payload);
        toast.success(`Promotion "${data.name}" created`);
      }
      handleClosePromotionModal();
      reload();
    } catch (err) {
      toastApiError(toast, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto font-sans">
      {error && (
        <div className="flex items-center justify-between bg-danger/10 text-danger rounded-[12px] px-4 py-3 text-[13px] font-semibold">
          <span>{error}</span>
          <button type="button" onClick={reload} className="underline">Retry</button>
        </div>
      )}

      <MarketingToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewClick={handleNewClick}
      />

      <section>
        {loading ? (
          <div className="text-center py-16 text-text-muted">Loading...</div>
        ) : activeTab === "coupons" ? (
          <CouponsTable
            coupons={coupons}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteCoupon}
          />
        ) : (
          <PromotionsTable
            promotions={promotions}
            onEdit={handleEditPromotion}
            onDelete={handleDeletePromotion}
          />
        )}
      </section>

      <CouponModal
        isOpen={couponModalOpen}
        onClose={() => !saving && setCouponModalOpen(false)}
        onSave={handleSaveCoupon}
        existingCodes={coupons.map((c) => c.code)}
        saving={saving}
      />

      <PromotionModal
        isOpen={promotionModalOpen}
        onClose={() => !saving && handleClosePromotionModal()}
        onSave={handleSavePromotion}
        promotion={editingPromotion}
        products={products}
      />
    </div>
  );
}
