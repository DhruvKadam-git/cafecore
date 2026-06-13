"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  CreditCard,
  Ticket,
  Calendar,
  Users,
  BarChart3,
  ShoppingBag,
  ChefHat,
  X,
  LucideIcon
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navLinkClass = (isActive: boolean) =>
  `flex items-center gap-3 h-[48px] px-4 rounded-[14px] text-[15px] font-medium transition-all duration-200 theme-transition ${
    isActive
      ? "bg-sidebar-active-bg text-sidebar-active-text font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
      : "text-white/85 hover:bg-white/10 hover:text-white"
  }`;

const navIconClass = (isActive: boolean) =>
  isActive ? "text-sidebar-active-icon" : "text-white/80";

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Products", href: "/products", icon: Package },
    { label: "Categories", href: "/categories", icon: Tag },
    { label: "Payment Methods", href: "/payments", icon: CreditCard },
    { label: "Coupons & Promos", href: "/coupons", icon: Ticket },
    { label: "Bookings", href: "/bookings", icon: Calendar },
    { label: "Users", href: "/users", icon: Users },
    // { label: "KDS Config", href: "/kds-config", icon: Monitor },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const bottomNavItems: NavItem[] = [
    { label: "POS Terminal", href: "/pos", icon: ShoppingBag },
    { label: "Kitchen KDS", href: "/kds", icon: ChefHat },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-4 bottom-4 h-[calc(100vh-32px)] w-[275px] bg-sidebar-bg text-white/90 z-50 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out border-tr-[22px] border-br-[22px] rounded-r-[22px] shadow-lg lg:translate-x-0 theme-transition ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section: Logo & Mobile Close */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between h-[50px] px-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl select-none">☕</span>
              <span className="font-bold text-[22px] tracking-tight font-sans">
                Brewhouse
              </span>
            </Link>
            {/* Close button for mobile drawer */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-full hover:bg-white/10 text-white/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={navLinkClass(isActive)}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className={navIconClass(isActive)}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 mt-auto">
          {/* Bottom Links (POS, KDS) */}
          <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={navLinkClass(isActive)}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className={navIconClass(isActive)}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Cookie button */}
          <div className="px-2 mt-2">
            <button
              type="button"
              suppressHydrationWarning
              className="w-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white text-[12px] py-2 px-3 rounded-[10px] transition-colors duration-200 text-left whitespace-nowrap"
            >
              Manage cookies or opt out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
