'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AdminUser, Role } from './types';

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  role: Role | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount by calling /api/admin/auth/me
  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then(async (res) => {
        if (!res.ok) return;
        const { user: u } = await res.json();
        setUser({
          id: u.userId,
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'active',
          joinedAt: '',
          phone: '',
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/admin/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error ?? 'Login failed.' };

        const u = json.user;
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'active',
          joinedAt: '',
          phone: '',
        });
        return { success: true };
      } catch {
        return { success: false, error: 'Network error. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, role: user?.role ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
