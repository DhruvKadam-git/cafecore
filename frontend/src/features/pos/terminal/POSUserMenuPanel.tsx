"use client";

import Link from "next/link";
import {
  ChefHat,
  ClipboardList,
  LayoutGrid,
  LogOut,
  Table2,
  UserCircle,
} from "lucide-react";

interface POSUserMenuPanelProps {
  onClose: () => void;
}

function MenuItem({
  href,
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  href?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const className = `w-full flex items-center gap-3 px-4 py-2.5 text-[14px] font-semibold transition-colors theme-transition ${
    danger
      ? "text-danger hover:bg-danger/5"
      : "text-text-heading hover:bg-background"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        <Icon size={18} strokeWidth={2} className={danger ? "text-danger" : "text-text-muted"} />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon size={18} strokeWidth={2} className={danger ? "text-danger" : "text-text-muted"} />
      {label}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-border-custom mx-3 theme-transition" />;
}

export function POSUserMenuPanel({ onClose }: POSUserMenuPanelProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-[240px] bg-surface border border-border-custom rounded-[14px] shadow-lg py-2 z-50 animate-theme-panel-in theme-transition">
      <MenuItem href="/pos/orders" icon={ClipboardList} label="Orders List" onClick={onClose} />
      <MenuItem href="/pos/tables" icon={Table2} label="Table View" onClick={onClose} />
      <MenuItem href="/pos/customers" icon={UserCircle} label="Customers" onClick={onClose} />

      <MenuDivider />

      <MenuItem href="/kds" icon={ChefHat} label="Kitchen Display" onClick={onClose} />
      <MenuItem href="/" icon={LayoutGrid} label="Admin Dashboard" onClick={onClose} />

      <MenuDivider />

      <MenuItem href="/login" icon={LogOut} label="Sign Out" danger onClick={onClose} />
    </div>
  );
}
