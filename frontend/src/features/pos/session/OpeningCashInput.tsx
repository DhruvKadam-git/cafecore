"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface OpeningCashInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OpeningCashInput({ value, onChange, error }: OpeningCashInputProps) {
  const numericValue = value === "" ? 0 : Number(value);

  const step = (delta: number) => {
    const next = Math.max(0, numericValue + delta);
    onChange(next === 0 ? "" : String(next));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="opening-cash" className="text-[13px] font-semibold text-[#1D1B1A]">
        Opening cash amount (₹)
      </label>
      <div className="relative">
        <input
          id="opening-cash"
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 5000"
          aria-label="Opening cash amount"
          aria-invalid={!!error}
          className={`w-full rounded-[12px] bg-[#F0EBE3] border pl-4 pr-12 py-3 text-[14px] font-medium text-[#1D1B1A] placeholder:text-[#7A6E63] outline-none transition-all duration-150 focus:border-[#C9773A] focus:ring-2 focus:ring-[#C9773A]/15 ${
            error ? "border-red-400" : "border-[#D8CCC1]"
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col border-l border-[#D8CCC1] pl-1">
          <button
            type="button"
            onClick={() => step(100)}
            className="p-1 text-[#7A6E63] hover:text-[#1D1B1A] transition-colors"
            aria-label="Increase amount"
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => step(-100)}
            className="p-1 text-[#7A6E63] hover:text-[#1D1B1A] transition-colors"
            aria-label="Decrease amount"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {error && <p className="text-[12px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
