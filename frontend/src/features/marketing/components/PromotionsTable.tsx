"use client";

import React from "react";
import { Promotion, formatPromotionDiscount, formatPromotionTrigger } from "@/lib/marketing-types";
import { ProductActions } from "@/features/products/components/ProductActions";
import { ScopeBadge } from "./ScopeBadge";
import { DiscountDisplay } from "./DiscountDisplay";

interface PromotionsTableProps {
  promotions: Promotion[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
}

export function PromotionsTable({
  promotions,
  onEdit,
  onDelete,
}: PromotionsTableProps) {
  return (
    <div className="w-full bg-surface border border-border-custom rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden theme-transition">
      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full border-collapse text-left font-sans min-w-[720px]">
          <thead>
            <tr className="bg-card-bg h-[48px] border-b border-border-custom theme-transition">
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Name
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Scope
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Trigger
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Discount
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {promotions.map((promotion) => (
              <tr
                key={promotion.id}
                className="h-[60px] border-b border-border-custom last:border-0 hover:bg-surface/80 transition-colors duration-200 theme-transition"
              >
                <td className="px-6 py-3 text-[15px] font-bold text-text-heading">
                  {promotion.name}
                </td>

                <td className="px-6 py-3">
                  <ScopeBadge scope={promotion.scope} />
                </td>

                <td className="px-6 py-3 text-[15px] font-medium text-text-heading">
                  {formatPromotionTrigger(promotion.triggerType, promotion.triggerValue)}
                </td>

                <td className="px-6 py-3">
                  <DiscountDisplay
                    label={formatPromotionDiscount(
                      promotion.discountType,
                      promotion.discountValue
                    )}
                  />
                </td>

                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <ProductActions
                      onEdit={() => onEdit(promotion)}
                      onDelete={() => onDelete(promotion.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {promotions.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[15px] font-medium text-text-muted"
                >
                  No promotions found. Click &quot;+ New Promotion&quot; to add one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
