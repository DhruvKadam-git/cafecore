"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X, RefreshCw } from "lucide-react";
import {
  CouponFormData,
  MarketingTab,
  Promotion,
  PromotionFormData,
} from "@/lib/marketing-types";
import { INITIAL_COUPONS, INITIAL_PROMOTIONS } from "@/lib/mock-marketing";
import { MarketingToolbar } from "@/features/marketing/components/MarketingToolbar";
import { CouponsTable } from "@/features/marketing/components/CouponsTable";
import { PromotionsTable } from "@/features/marketing/components/PromotionsTable";
import { CouponModal } from "@/features/marketing/components/CouponModal";
import { PromotionModal } from "@/features/marketing/components/PromotionModal";

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<MarketingTab>("coupons");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );

  const [aiRecommendation, setAiRecommendation] = useState<{
    analysis: string;
    name: string;
    description: string;
    type: string;
    value: number;
    durationDays: number;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [pastPromoNames, setPastPromoNames] = useState<string[]>([]);

  // Auto-login to obtain JWT token for AI Promotion Generation
  useEffect(() => {
    async function autoLogin() {
      try {
        const response = await fetch("http://localhost:3000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@cafe.com",
            password: "Admin@123",
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setToken(data.accessToken);
        }
      } catch (err) {
        console.error("Coupons page auto-login error:", err);
      }
    }
    autoLogin();
  }, []);

  const fetchCouponsAndPromotions = async (jwt: string) => {
    const headers = { Authorization: `Bearer ${jwt}` };
    try {
      const [couponsRes, promotionsRes] = await Promise.all([
        fetch("http://localhost:3000/coupons", { headers }),
        fetch("http://localhost:3000/promotions", { headers }),
      ]);
      if (couponsRes.ok) {
        const data = await couponsRes.json();
        const mappedCoupons = data.map((c: any) => ({
          id: c.id,
          code: c.code,
          discountType: "percentage",
          value: Number(c.discountPercentage),
          active: new Date(c.expiryDate) > new Date() && c.currentUsageCount < c.maxUsageCount,
        }));
        setCoupons(mappedCoupons);
      }
      if (promotionsRes.ok) {
        const data = await promotionsRes.json();
        const mappedPromotions = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          scope: "order",
          triggerType: "min_amount",
          triggerValue: 0,
          discountType: String(p.type).toLowerCase() === "percentage" ? "percentage" : "fixed_amount",
          discountValue: Number(p.value),
        }));
        setPromotions(mappedPromotions);
      }
    } catch (err) {
      console.error("Error fetching coupons/promotions:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCouponsAndPromotions(token);
    }
  }, [token]);

  const handleAiClick = async () => {
    if (!token) {
      alert("Authenticating with backend server... Please try again in a moment.");
      return;
    }
    setIsAiLoading(true);
    try {
      const excludeQuery = pastPromoNames.length > 0 ? `?exclude=${encodeURIComponent(pastPromoNames.join(","))}` : "";
      const response = await fetch(`http://localhost:3000/promotions/generate-ai${excludeQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAiRecommendation(data);
        if (data && data.name) {
          setPastPromoNames(prev => {
            const next = [...prev, data.name];
            if (next.length > 5) next.shift();
            return next;
          });
        }
      } else {
        alert("Failed to generate AI promotion recommendation.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const newActive = !coupon.active;
    const newExpiryDate = newActive
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date("1970-01-01").toISOString();

    try {
      const response = await fetch(`http://localhost:3000/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expiryDate: newExpiryDate,
        }),
      });
      if (response.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: newActive } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        const response = await fetch(`http://localhost:3000/coupons/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setCoupons((prev) => prev.filter((c) => c.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this promotion?")) {
      try {
        const response = await fetch(`http://localhost:3000/promotions/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setPromotions((prev) => prev.filter((p) => p.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
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
    if (!token) return;
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `http://localhost:3000/coupons/${data.id}` : "http://localhost:3000/coupons";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: data.code,
          description: `Discount coupon for ${data.code}`,
          discountPercentage: data.value,
          expiryDate: data.active
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date("1970-01-01").toISOString(),
          maxUsageCount: 1000,
        }),
      });
      if (response.ok) {
        fetchCouponsAndPromotions(token);
        setCouponModalOpen(false);
      } else {
        const err = await response.json();
        alert(`Error saving coupon: ${err.message || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePromotion = async (data: PromotionFormData) => {
    if (!token) return;
    try {
      const isEdit = !!data.id;
      const url = isEdit ? `http://localhost:3000/promotions/${data.id}` : "http://localhost:3000/promotions";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: `Promotion: ${data.name}`,
          type: data.discountType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
          value: data.discountValue,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        }),
      });
      if (response.ok) {
        fetchCouponsAndPromotions(token);
        handleClosePromotionModal();
      } else {
        const err = await response.json();
        alert(`Error saving promotion: ${err.message || "Failed"}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 max-w-[1600px] mx-auto font-sans">
      <MarketingToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewClick={handleNewClick}
        onAiClick={handleAiClick}
        isAiLoading={isAiLoading}
      />

      <section>
        {activeTab === "coupons" ? (
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
        onClose={() => setCouponModalOpen(false)}
        onSave={handleSaveCoupon}
        existingCodes={coupons.map((c) => c.code)}
      />

      <PromotionModal
        isOpen={promotionModalOpen}
        onClose={handleClosePromotionModal}
        onSave={handleSavePromotion}
        promotion={editingPromotion}
      />
    </div>
      {aiRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface border border-border-custom rounded-[20px] w-full max-w-[480px] shadow-xl p-6 flex flex-col gap-5 theme-transition animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-[18px]">
                <Sparkles size={20} className="animate-pulse" />
                <span>AI Generated Promotion</span>
              </div>
              <button
                type="button"
                onClick={() => setAiRecommendation(null)}
                className="p-1 rounded-full text-text-muted hover:text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 bg-primary/5 border border-primary/10 rounded-[12px] p-4">
              <h4 className="text-[13px] font-bold text-primary">AI Business Insights</h4>
              <p className="text-[14px] text-text-body leading-relaxed font-medium">
                {aiRecommendation.analysis}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-bold text-text-muted">Promotion Name</label>
                <p className="text-[15px] font-bold text-text-heading mt-0.5">{aiRecommendation.name}</p>
              </div>

              <div>
                <label className="text-[12px] font-bold text-text-muted">Catchy Offer</label>
                <p className="text-[15px] font-bold text-primary mt-0.5">{aiRecommendation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-text-muted">Type</label>
                  <p className="text-[14px] font-semibold text-text-heading mt-0.5 capitalize">{aiRecommendation.type}</p>
                </div>
                <div>
                  <label className="text-[12px] font-bold text-text-muted">Discount Value</label>
                  <p className="text-[14px] font-semibold text-text-heading mt-0.5">
                    {aiRecommendation.type === "percentage" ? `${aiRecommendation.value}%` : `$${aiRecommendation.value.toFixed(2)}`}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-text-muted">Suggested Duration</label>
                <p className="text-[14px] font-semibold text-text-heading mt-0.5">{aiRecommendation.durationDays} Days</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiRecommendation(null)}
                  className="h-[44px] rounded-[12px] bg-white border border-border-custom text-[14px] font-semibold text-text-heading hover:bg-surface transition-colors cursor-pointer theme-transition"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    try {
                      const response = await fetch("http://localhost:3000/promotions", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          name: aiRecommendation.name,
                          description: aiRecommendation.description,
                          type: aiRecommendation.type.toLowerCase(),
                          value: aiRecommendation.value,
                          startDate: new Date().toISOString(),
                          endDate: new Date(Date.now() + aiRecommendation.durationDays * 24 * 60 * 60 * 1000).toISOString(),
                          isActive: true
                        }),
                      });

                      if (response.ok) {
                        fetchCouponsAndPromotions(token);
                        setAiRecommendation(null);
                      } else {
                        const errData = await response.json();
                        alert("Error applying promotion: " + (errData.message || response.statusText));
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Failed to save promotion to backend database.");
                    }
                  }}
                  className="h-[44px] rounded-[12px] bg-primary text-white text-[14px] font-semibold hover:brightness-[1.04] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Apply Promotion</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleAiClick}
                disabled={isAiLoading}
                className="w-full h-[40px] rounded-[12px] border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[13px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={isAiLoading ? "animate-spin" : ""} />
                <span>Generate Another</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
