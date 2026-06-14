interface POSSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function POSSearchBar({ value, onChange }: POSSearchBarProps) {
  return (
    <div className="relative shrink-0">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A866F] pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="w-full h-[42px] bg-[#E9E1D7] border border-[#D4C6B8] rounded-[14px] pl-11 pr-4 text-[14px] font-medium text-[#1F1712] placeholder:text-[#9A866F] outline-none focus:border-[#D17A3B] focus:shadow-[0_0_0_3px_rgba(209,122,59,0.15)] transition-all"
      />
    </div>
  );
}
