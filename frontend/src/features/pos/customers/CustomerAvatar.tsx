export function getCustomerInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface CustomerAvatarProps {
  name: string;
}

export function CustomerAvatar({ name }: CustomerAvatarProps) {
  return (
    <div className="w-12 h-12 rounded-full bg-sidebar-bg text-primary text-[18px] font-bold flex items-center justify-center shrink-0 theme-transition">
      {getCustomerInitials(name)}
    </div>
  );
}
