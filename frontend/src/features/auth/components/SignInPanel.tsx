"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthInput } from "./AuthInput";

type LoginRole = "Employee" | "Admin";

interface SignInPanelProps {
  onCreateAccount: () => void;
}

export function SignInPanel({ onCreateAccount }: SignInPanelProps) {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("Employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.push(role === "Employee" ? "/pos/session" : "/");
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="text-text-muted hover:text-text-heading transition-colors p-0.5"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="px-8 py-9 sm:px-10 sm:py-10 flex flex-col bg-surface theme-transition">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-text-heading leading-tight">Sign in</h2>
        <p className="text-[14px] font-medium text-text-muted mt-1">
          Access your POS session
        </p>
      </div>

      {/* Role toggle */}
      <div className="flex rounded-full bg-background border border-border-custom p-1 mb-6 theme-transition">
        {(["Employee", "Admin"] as LoginRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 rounded-full text-[13px] font-bold transition-all duration-200 ${
              role === r
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-body"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-6">
        <AuthInput
          id="signin-email"
          type="email"
          label="Email address"
          placeholder="you@brewhouse.com"
          value={email}
          onChange={setEmail}
          icon={Mail}
        />
        <AuthInput
          id="signin-password"
          type={showPassword ? "text" : "password"}
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          icon={Lock}
          rightAction={passwordToggle}
        />
      </div>

      {/* Login button */}
      <button
        type="button"
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:brightness-105 text-white text-[15px] font-bold py-3.5 rounded-[12px] transition-all duration-150 active:scale-[0.98] shadow-sm"
      >
        Login
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>

      {/* Create account link */}
      <p className="text-[13px] font-medium text-text-muted text-center mt-5">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onCreateAccount}
          className="font-bold text-primary hover:brightness-110 transition-colors"
        >
          Create account
        </button>
      </p>

      {/* Demo quick access */}
      <div className="mt-6 pt-6 border-t border-border-custom">
        <p className="text-[12px] font-semibold text-text-muted text-center mb-3 tracking-wide uppercase">
          Demo quick access
        </p>
        <div className="flex gap-2.5">
          {[
            { label: "POS", href: "/pos/session" },
            { label: "Admin", href: "/" },
            { label: "Kitchen", href: "/kds" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex-1 text-center py-2.5 rounded-[10px] border border-border-custom text-[13px] font-bold text-text-heading hover:border-primary hover:bg-primary/8 transition-all duration-150 theme-transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
