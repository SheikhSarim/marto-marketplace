// Non-data client preference & guest-cart storage keys and safe wrappers.
// Zero dummy data, zero seed users, zero mock records.

export const CLIENT_STORAGE_KEYS = {
  GUEST_CART: 'marto_cart_v1',
  RECENT_SEARCHES: 'marto_recent_searches_v1',
  SIDEBAR_COLLAPSED: 'marto_sidebar_collapsed',
} as const;

export function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/privacy errors
  }
}

export function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}
