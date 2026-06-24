interface POSCategoryFiltersProps {
  categories: readonly string[];
  active: string;
  onChange: (category: string) => void;
}

export function POSCategoryFilters({ categories, active, onChange }: POSCategoryFiltersProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`shrink-0 h-[34px] px-[18px] rounded-full text-[14px] font-semibold transition-all duration-150 ${
            active === cat
              ? "bg-[#D17A3B] text-white"
              : "bg-[#E7DFD4] text-[#7E5E47] hover:bg-[#D17A3B] hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
