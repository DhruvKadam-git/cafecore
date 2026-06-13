"use client";

import React, { useState } from "react";
import { ArrowRight, ChevronDown, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthInput } from "./AuthInput";

type SignUpRole = "Employee" | "Admin";

export function SignUpPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignUpRole>("Employee");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6) e.password = "Minimum 6 characters.";
    return e;
  };

  const handleSignUp = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      setSuccess(false);
      return;
    }
    setErrors({});
    setSuccess(true);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="text-white/40 hover:text-white/70 transition-colors p-0.5"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="bg-[#1E1812] px-8 py-9 sm:px-10 sm:py-10 flex flex-col">
      <div className="mb-7">
        <h2 className="text-[22px] font-bold text-white leading-tight">Create account</h2>
        <p className="text-[14px] font-medium text-white/50 mt-1">
          Register a new employee or admin
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <AuthInput
          id="signup-name"
          label="Full name"
          placeholder="Your full name"
          value={name}
          onChange={setName}
          icon={User}
          variant="dark"
          error={errors.name}
        />
        <AuthInput
          id="signup-email"
          type="email"
          label="Email address"
          placeholder="you@brewhouse.com"
          value={email}
          onChange={setEmail}
          icon={Mail}
          variant="dark"
          error={errors.email}
        />
        <AuthInput
          id="signup-password"
          type={showPassword ? "text" : "password"}
          label="Choose password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={setPassword}
          icon={Lock}
          variant="dark"
          rightAction={passwordToggle}
          error={errors.password}
        />

        {/* Role dropdown */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-role" className="text-[13px] font-semibold text-white/80">
            Role
          </label>
          <div className="relative">
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value as SignUpRole)}
              className="w-full appearance-none rounded-[12px] pl-4 pr-10 py-3 text-[14px] font-medium bg-white/8 border border-white/15 text-white outline-none transition-all duration-150 focus:border-white/30 focus:ring-2 focus:ring-white/10 cursor-pointer"
            >
              <option value="Employee" className="bg-[#2C2118] text-white">Employee</option>
              <option value="Admin" className="bg-[#2C2118] text-white">Admin</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {success && (
        <p className="text-[13px] font-semibold text-success mb-4 bg-success/10 border border-success/20 rounded-[10px] px-3 py-2.5">
          Account created successfully! You can sign in on the left.
        </p>
      )}

      <button
        type="button"
        onClick={handleSignUp}
        className="w-full flex items-center justify-center gap-2 bg-success hover:brightness-105 text-white text-[15px] font-bold py-3.5 rounded-[12px] transition-all duration-150 active:scale-[0.98] shadow-sm"
      >
        Sign Up
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>

      <p className="text-[12px] font-medium text-white/40 text-center mt-6">
        Already have an account? Sign in on the left.
      </p>
    </div>
  );
}
