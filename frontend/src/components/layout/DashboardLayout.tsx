"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/":          "Dashboard",
  "/products":  "Products",
  "/categories":"Categories",
  "/payments":  "Payment Methods",
  "/coupons":   "Coupons & Promos",
  "/bookings":  "Bookings",
  "/users":     "Users",
  "/kds-config":"KDS Config",
  "/reports":   "Reports",
  "/pos":       "POS Terminal",
  "/kds":       "Kitchen KDS",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/pos") || pathname === "/kds" || pathname === "/login") {
    return <>{children}</>;
  }

  const title = pageTitles[pathname] ?? "Brewhouse";

  return (
    <div className="min-h-screen bg-background flex flex-row overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[275px] min-h-screen transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-[80px] w-full flex items-center justify-between px-6 md:px-8 border-b border-border-custom bg-background z-20 theme-transition">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-surface hover:bg-border-custom text-text-heading transition-colors cursor-pointer theme-transition"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            
            {/* Title & Date */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-mono font-medium text-lg hidden lg:inline">#</span>
                <h1 className="text-[22px] sm:text-[28px] font-bold text-text-heading leading-none font-sans">
                  {title}
                </h1>
              </div>
              <p className="text-[12px] sm:text-[13px] font-medium text-text-muted mt-1 select-none">
                Saturday, June 13, 2026
              </p>
            </div>
          </div>

          {/* User Profile info */}
          <div className="flex items-center gap-3">
            {/* Initials Avatar */}
            <div className="w-[40px] h-[40px] rounded-full bg-primary flex items-center justify-center text-white font-bold text-[15px] select-none shadow-sm">
              OC
            </div>
            
            {/* Name and Role Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-text-heading font-sans hidden sm:inline">
                Olivia Chen
              </span>
              <span className="h-[28px] px-3 rounded-full bg-primary/10 text-primary text-[13px] font-semibold flex items-center justify-center select-none">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
