"use client";

import React from "react";

interface UserAvatarProps {
  name: string;
  color: string;
  size?: number;
  fontSize?: number;
}

export function UserAvatar({ name, color, size = 36, fontSize = 14 }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white select-none shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
    >
      {initials}
    </div>
  );
}
