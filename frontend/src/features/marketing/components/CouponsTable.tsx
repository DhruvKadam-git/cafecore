"use client";

import React from "react";
import {
  Coupon,
  formatCouponDiscountType,
  formatCouponValue,
} from "@/lib/marketing-types";
import { StatusToggle } from "@/features/products/components/StatusToggle";
import { DeleteActionButton } from "./DeleteActionButton";

interface CouponsTableProps {
  coupons: Coupon[];
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CouponsTable({
  coupons,
  onToggleActive,
  onDelete,
}: CouponsTableProps) {
  return (
    <div className="w-full bg-surface border border-border-custom rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden theme-transition">
      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full border-collapse text-left font-sans min-w-[640px]">
          <thead>
            <tr className="bg-card-bg h-[48px] border-b border-border-custom theme-transition">
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Code
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Discount Type
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Value
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none">
                Active
              </th>
              <th className="px-6 py-2 text-[14px] font-medium text-text-heading select-none text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="h-[60px] border-b border-border-custom last:border-0 hover:bg-surface/80 transition-colors duration-200 theme-transition"
              >
                <td className="px-6 py-3 text-[15px] font-bold font-mono text-primary">
                  {coupon.code}
                </td>

                <td className="px-6 py-3 text-[15px] font-medium text-text-heading">
                  {formatCouponDiscountType(coupon.discountType)}
                </td>

                <td className="px-6 py-3 text-[15px] font-bold text-text-heading">
                  {formatCouponValue(coupon.discountType, coupon.value)}
                </td>

                <td className="px-6 py-3">
                  <StatusToggle
                    checked={coupon.active}
                    onChange={() => onToggleActive(coupon.id)}
                  />
                </td>

                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <DeleteActionButton
                      onDelete={() => onDelete(coupon.id)}
                      title="Delete Coupon"
                    />
                  </div>
                </td>
              </tr>
            ))}

            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-[15px] font-medium text-text-muted"
                >
                  No coupons found. Click &quot;+ New Coupon&quot; to add one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
