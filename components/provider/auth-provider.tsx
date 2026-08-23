"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { db } from "@/services/database";
import type { AuthContextValue, AuthUser, UserRole } from "@/types/auth";

const STORAGE_KEY = "vidyagruha.session";

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = readStoredSession();
      setUser(stored);
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(
    async (
      roleOrIdentifier: UserRole | string,
      password?: string,
      role?: UserRole
    ): Promise<{ success: boolean; error?: string }> => {
      // 1. If called with credentials (identifier, password, role)
      if (password !== undefined) {
        const result = db.authenticate(roleOrIdentifier, password, role);
        if (!result.success || !result.user) {
          return { success: false, error: result.error || "Invalid credentials." };
        }

        const dbUser = result.user;
        const authUser: AuthUser = {
          id: dbUser.id,
          name: dbUser.displayName,
          displayName: dbUser.displayName,
          role: dbUser.role,
          email: dbUser.email,
          username: dbUser.username,
          programme: dbUser.programme,
          year: dbUser.year,
          department: dbUser.department,
          roleName: dbUser.role === "admin" ? "System Administrator" : undefined,
        };

        setUser(authUser);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        } catch {
          // ignore localStorage failure in private mode
        }
        return { success: true };
      }

      // 2. Direct role quick-login fallback (e.g. for developer preview)
      const roleTarget = roleOrIdentifier as UserRole;
      const roleUsers = db.getUsersByRole(roleTarget).filter((u) => u.status === "active");
      const defaultUser = roleUsers[0];

      if (defaultUser) {
        const authUser: AuthUser = {
          id: defaultUser.id,
          name: defaultUser.displayName,
          displayName: defaultUser.displayName,
          role: defaultUser.role,
          email: defaultUser.email,
          username: defaultUser.username,
          programme: defaultUser.programme,
          year: defaultUser.year,
          department: defaultUser.department,
          roleName: defaultUser.role === "admin" ? "System Administrator" : undefined,
        };

        setUser(authUser);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        } catch {
          // ignore
        }
        return { success: true };
      }

      return { success: false, error: "No user found for this role." };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors during logout.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
