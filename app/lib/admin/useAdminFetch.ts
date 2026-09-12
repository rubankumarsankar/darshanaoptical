'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAdminFetch — drop-in replacement for getStore().
 * Fetches data from an admin API route and keeps it fresh.
 *
 * @example
 * const { data, loading, error, refetch } = useAdminFetch<{ customers: Customer[] }>('/api/admin/customers');
 */
export function useAdminFetch<T>(
  url: string | null,
  options?: { params?: Record<string, string>; skip?: boolean }
) {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: !!url, error: null });
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || options?.skip) return;
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const fullUrl = options?.params
        ? `${url}?${new URLSearchParams(options.params).toString()}`
        : url;
      const res = await fetch(fullUrl, { signal: ctrl.signal });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setState({ data: json as T, loading: false, error: null });
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setState({ data: null, loading: false, error: err.message ?? 'Failed to load data.' });
    }
  }, [url, options?.skip, JSON.stringify(options?.params)]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
