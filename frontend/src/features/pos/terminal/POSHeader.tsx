import { POSBrand } from "./POSBrand";
import { POSTableSelector } from "./POSTableSelector";
import { POSUserMenu } from "./POSUserMenu";

interface POSHeaderProps {
  tableLabel: string | null;
  onSelectTable: () => void;
}

export function POSHeader({ tableLabel, onSelectTable }: POSHeaderProps) {
  return (
    <header className="relative h-[60px] shrink-0 bg-[#160D09] flex items-center justify-between px-5 md:px-6">
      <POSBrand />
      <div className="absolute left-1/2 -translate-x-1/2">
        <POSTableSelector tableLabel={tableLabel} onClick={onSelectTable} />
      </div>
      <POSUserMenu />
    </header>
  );
}
