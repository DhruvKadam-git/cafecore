"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from "@/lib/api/config";
import * as authService from "@/lib/api/auth.service";
import { ApiUser } from "@/lib/api/types";

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  signup: (name: string, email: string, password: string, role?: "ADMIN" | "EMPLOYEE") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        if (!storedToken) return;
        setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser) as ApiUser);
        const me = await authService.getMe();
        setUser(me);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    }
    hydrate();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, role: "ADMIN" | "EMPLOYEE" = "EMPLOYEE") => {
      await authService.signup(name, email, password, role);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [user, token, isReady, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
