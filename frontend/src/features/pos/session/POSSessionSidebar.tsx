"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Coffee, Home, ShoppingBag } from "lucide-react";

const navItems = [
  { href: "/pos/session", icon: Home, label: "Session" },
  { href: "/pos", icon: ShoppingBag, label: "POS Terminal" },
  { href: "/kds", icon: ChefHat, label: "Kitchen" },
];

export function POSSessionSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-16 flex-col items-center py-6 bg-[#1D1B1A] border-r border-white/5 z-30">
      <div className="w-10 h-10 rounded-[12px] bg-[#2A2726] flex items-center justify-center mb-8">
        <Coffee size={20} className="text-[#D17A3B]" strokeWidth={2} />
      </div>

      <nav className="flex flex-col items-center gap-7">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/pos/session"
              ? pathname.startsWith("/pos/session")
              : href === "/pos"
                ? pathname === "/pos"
                : pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`w-11 h-11 flex items-center justify-center rounded-[16px] transition-all duration-200 ${
                isActive
                  ? "bg-[#4F46E5] text-white shadow-md"
                  : "text-white/60 hover:bg-[#2A2726] hover:text-white"
              }`}
            >
              <Icon size={22} strokeWidth={2} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
