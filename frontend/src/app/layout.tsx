import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  DEFAULT_THEME_ID,
  getThemeVarsForScriptWithAliases,
  REMOVED_THEME_ALIASES,
  STORAGE_KEY,
} from "@/lib/theme-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brewhouse Admin Dashboard",
  description: "POS Admin & ERP Dashboard for Brewhouse Coffee Shop",
};

const themeInitScript = `
(function() {
  var THEMES = ${JSON.stringify(getThemeVarsForScriptWithAliases())};
  var ALIASES = ${JSON.stringify(REMOVED_THEME_ALIASES)};
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var id = stored && THEMES[stored] ? stored : (stored && ALIASES[stored] ? ALIASES[stored] : "${DEFAULT_THEME_ID}");
    if (stored && ALIASES[stored] && stored !== id) {
      localStorage.setItem("${STORAGE_KEY}", id);
    }
    var vars = THEMES[id];
    var root = document.documentElement;
    root.setAttribute("data-theme", id);
    for (var key in vars) {
      root.style.setProperty(key, vars[key]);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full font-sans bg-background text-text-body">
        <AppProviders>
          <DashboardLayout>{children}</DashboardLayout>
        </AppProviders>
      </body>
    </html>
  );
}
