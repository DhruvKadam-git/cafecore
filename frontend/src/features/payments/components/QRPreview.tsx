"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";

interface QRPreviewProps {
  upiId: string;
  size?: number;
}

function getThemeColors() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return {
    dark: style.getPropertyValue("--text-heading").trim() || "#2B1F16",
    light: style.getPropertyValue("--input").trim() || "#ffffff",
  };
}

export function QRPreview({ upiId, size = 140 }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { themeId } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !upiId.trim()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { dark, light } = getThemeColors();
    const modules = 25;
    const cell = Math.floor(size / modules);
    const offset = Math.floor((size - modules * cell) / 2);

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);

    const str = `upi://pay?pa=${upiId}&pn=Brewhouse`;
    const seed = str.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

    const pseudo = (i: number, j: number) => {
      const v = (seed * (i + 1) * 37 + (j + 1) * 17 + i * j) % 97;
      return v < 48;
    };

    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const isDark = pseudo(i, j);
        ctx.fillStyle = isDark ? dark : light;
        ctx.fillRect(offset + j * cell, offset + i * cell, cell, cell);
      }
    }

    const drawFinder = (startX: number, startY: number) => {
      ctx.fillStyle = dark;
      ctx.fillRect(startX, startY, cell * 7, cell * 7);
      ctx.fillStyle = light;
      ctx.fillRect(startX + cell, startY + cell, cell * 5, cell * 5);
      ctx.fillStyle = dark;
      ctx.fillRect(startX + cell * 2, startY + cell * 2, cell * 3, cell * 3);
    };

    drawFinder(offset, offset);
    drawFinder(offset + (modules - 7) * cell, offset);
    drawFinder(offset, offset + (modules - 7) * cell);
  }, [upiId, size, themeId]);

  if (!upiId.trim()) {
    return (
      <div
        className="flex items-center justify-center bg-surface rounded-[12px] border border-dashed border-border-custom theme-transition"
        style={{ width: size, height: size }}
      >
        <p className="text-[12px] text-text-muted font-semibold text-center px-2">
          Enter UPI ID to generate QR
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-2.5 bg-input rounded-[12px] border border-border-custom shadow-sm theme-transition">
        <canvas ref={canvasRef} width={size} height={size} style={{ display: "block" }} />
      </div>
      <p className="text-[11px] font-semibold text-text-muted text-center">
        UPI QR · <span className="text-text-heading font-bold">{upiId}</span>
      </p>
    </div>
  );
}
