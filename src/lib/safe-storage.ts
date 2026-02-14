/**
 * Safe localStorage wrapper - tránh "Unexpected end of JSON input" khi data bị corrupt
 */

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw || typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Parse JSON an toàn, trả fallback nếu lỗi */
export { safeParseJson };

/** Storage wrapper an toàn - getItem tự xóa data corrupt để tránh "Unexpected end of JSON input" */
export function createSafeStorage(): Storage {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
      length: 0,
      clear: () => {},
    } as Storage;
  }

  return {
    getItem(k: string): string | null {
      try {
        const raw = localStorage.getItem(k);
        if (!raw || raw.trim() === '') return null;
        JSON.parse(raw);
        return raw;
      } catch {
        localStorage.removeItem(k);
        return null;
      }
    },
    setItem(k: string, v: string): void {
      localStorage.setItem(k, v);
    },
    removeItem(k: string): void {
      localStorage.removeItem(k);
    },
    key(i: number): string | null {
      return localStorage.key(i);
    },
    get length() {
      return localStorage.length;
    },
    clear(): void {
      localStorage.clear();
    },
  };
}
