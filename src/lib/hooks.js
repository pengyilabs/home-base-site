import { useEffect, useState } from "react";

async function getJSON(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data?.error) throw new Error(data?.error ?? `Request failed (${res.status})`);
  return data;
}

/**
 * Loads the three tables this site exposes. Returns one record array per key
 * so views can join them without each doing its own fetch.
 */
export function useBase() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    products: [],
    orders: [],
    orderProducts: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [products, orders, orderProducts] = await Promise.all([
          getJSON("/api/records?table=products"),
          getJSON("/api/records?table=orders"),
          getJSON("/api/records?table=orderProducts"),
        ]);
        if (!cancelled) setState({ loading: false, error: null, products, orders, orderProducts });
      } catch (err) {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * State persisted to localStorage. Used by the recipe and plan tools, which are
 * deliberately local-only: they never write to the Feishu Base.
 */
export function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    // initialValue may be a function, which keeps callers from rebuilding the
    // default (e.g. a date-stamped plan name) on every render.
    const fallback = typeof initialValue === "function" ? initialValue() : initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable (private mode, quota) — the tools still work
      // for the current session, they just will not survive a reload.
    }
  }, [key, value]);

  return [value, setValue];
}

/** Group order-product rows by their 订单号 so an order can show its items. */
export function groupItemsByOrder(orderProducts) {
  const map = new Map();
  for (const record of orderProducts) {
    const key = record.fields["订单号"];
    if (!key) continue;
    const existing = map.get(key);
    if (existing) existing.push(record);
    else map.set(key, [record]);
  }
  return map;
}