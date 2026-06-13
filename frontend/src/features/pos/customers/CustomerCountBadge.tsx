interface CustomerCountBadgeProps {
  count: number;
}

export function CustomerCountBadge({ count }: CustomerCountBadgeProps) {
  return (
    <span className="w-7 h-7 rounded-full bg-surface text-text-body text-[13px] font-bold flex items-center justify-center shrink-0 theme-transition">
      {count}
    </span>
  );
}
