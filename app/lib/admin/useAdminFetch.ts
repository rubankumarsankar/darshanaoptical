'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { handleAdminUnauthorized } from './api';

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
  const abortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);

  // Callers pass `params` as a fresh object literal on every render, so the
  // dependency has to be its serialised value. Extracted to a variable because
  // the lint rule requires dependency arrays to hold plain expressions.
  const skip = options?.skip ?? false;
  const paramsKey = options?.params ? JSON.stringify(options.params) : '';

  const fetchData = useCallback(async () => {
    if (!url || skip) return;
    const query = paramsKey ? new URLSearchParams(JSON.parse(paramsKey)).toString() : '';
    const fullUrl = query ? `${url}?${query}` : url;

    // Reuse the request when Strict Mode immediately replays this effect.
    if (requestKeyRef.current === fullUrl && inFlightRef.current) {
      return inFlightRef.current;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    requestKeyRef.current = fullUrl;

    const request = (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res = await fetch(fullUrl, { signal: ctrl.signal });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (res.status === 401) {
            await handleAdminUnauthorized();
            return;
          }
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        setState({ data: json as T, loading: false, error: null });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setState({ data: null, loading: false, error: err.message ?? 'Failed to load data.' });
      } finally {
        if (abortRef.current === ctrl) {
          inFlightRef.current = null;
          requestKeyRef.current = null;
        }
      }
    })();

    inFlightRef.current = request;
    return request;
  }, [url, skip, paramsKey]);

  useEffect(() => {
    if (abortTimerRef.current) {
      clearTimeout(abortTimerRef.current);
      abortTimerRef.current = null;
    }
    fetchData();
    return () => {
      // Delay by one task so Strict Mode's immediate effect replay can reuse
      // the same request. A real unmount still aborts promptly.
      abortTimerRef.current = setTimeout(() => abortRef.current?.abort(), 0);
    };
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
