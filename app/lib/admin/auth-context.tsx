'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AdminUser, Role } from './types';
import { MOCK_STAFF, MOCK_CREDENTIALS } from './mock-data';

// ─── Auth Context ─────────────────────────────────────────────────────────────

const AUTH_KEY = 'darshana_admin_auth';

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  role: Role | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AdminUser;
        const found = MOCK_STAFF.find((s) => s.id === saved.id);
        if (found && found.status === 'active') {
          setUser(found);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const cred = MOCK_CREDENTIALS[email.toLowerCase().trim()];
      if (!cred) return { success: false, error: 'No account found with this email.' };
      if (cred.password !== password) return { success: false, error: 'Incorrect password.' };

      const found = MOCK_STAFF.find((s) => s.id === cred.userId);
      if (!found) return { success: false, error: 'User account not found.' };
      if (found.status !== 'active') return { success: false, error: 'Your account is inactive. Contact Admin.' };

      setUser(found);
      localStorage.setItem(AUTH_KEY, JSON.stringify(found));
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
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
