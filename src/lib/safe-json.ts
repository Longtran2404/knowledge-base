/**
 * Safe JSON parsing for client (localStorage, fetch response).
 * Re-exports safeParseJson and adds safeResponseJson to avoid "Unexpected end of JSON input".
 */

import { safeParseJson as safeParseJsonFromStorage } from "./safe-storage";

/** Parse JSON safely; returns fallback on empty/invalid string. */
export function safeParseJson<T>(raw: string | null, fallback: T): T {
  return safeParseJsonFromStorage(raw, fallback);
}

/**
 * Read response body as text then parse as JSON safely.
 * Use instead of response.json() when body may be empty or invalid.
 */
export async function safeResponseJson<T>(response: Response, fallback: T): Promise<T> {
  const text = await response.text();
  return safeParseJson(text, fallback);
}
