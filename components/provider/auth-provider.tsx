"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_USERS } from "@/mocks/users";
import type { AuthContextValue, AuthUser, UserRole } from "@/types/auth";

const STORAGE_KEY = "campusone.mock-session";

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Development-only mock authentication. The stored value is not secure;
 * real authentication will replace this layer later without UI changes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(readStoredSession());
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback((role: UserRole) => {
    const nextUser = MOCK_USERS[role];
    setUser(nextUser);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // Storage unavailable (e.g. private mode) — session still works in memory.
    }
  }, []);

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
    [user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
