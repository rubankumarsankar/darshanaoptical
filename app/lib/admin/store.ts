import type { AdminStore } from './types';
import { INITIAL_STORE } from './mock-data';

const STORE_KEY = 'darshana_admin_store';

// ─── Store Access ─────────────────────────────────────────────────────────────

export function getStore(): AdminStore {
  if (typeof window === 'undefined') return INITIAL_STORE;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(INITIAL_STORE));
      return INITIAL_STORE;
    }
    const parsed = JSON.parse(raw) as AdminStore;
    return parsed.initialized ? parsed : INITIAL_STORE;
  } catch {
    return INITIAL_STORE;
  }
}

export function saveStore(store: AdminStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    console.error('Failed to save store to localStorage');
  }
}

export function resetStore(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(INITIAL_STORE));
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nextCustomerId(): string {
  const store = getStore();
  const count = store.customers.length + 1;
  const year = new Date().getFullYear();
  return `DO-${year}-${String(count).padStart(3, '0')}`;
}

export function nextInvoiceNumber(): string {
  const store = getStore();
  const count = store.invoices.length + 1;
  const year = new Date().getFullYear();
  return `DO-${year}-${String(count + 120).padStart(5, '0')}`;
}

export function nextPurchaseNumber(): string {
  const store = getStore();
  const count = store.purchases.length + 1;
  const year = new Date().getFullYear();
  return `PO-${year}-${String(count).padStart(3, '0')}`;
}
