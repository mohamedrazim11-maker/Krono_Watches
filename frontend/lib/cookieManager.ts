/**
 * Krono Client Cookie Management Utility
 * Provides secure handling for client-accessible cookies, inspection,
 * and state synchronization across browser contexts.
 */

export interface CookieOptions {
  path?: string;
  maxAge?: number; // seconds
  expires?: Date;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
}

export interface ClientSessionData {
  userId: string;
  name: string;
  email: string;
  role: string;
  sessionId: string;
  expiresAt: number;
}

/**
 * Read a cookie by name from document.cookie
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + encodeURIComponent(name) + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set a client-side cookie with standard attributes
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") return;

  const {
    path = "/",
    maxAge,
    expires,
    sameSite = "Lax",
    secure = typeof window !== "undefined" && window.location.protocol === "https:",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  } else if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookieString += "; Secure";
  }

  document.cookie = cookieString;
}

/**
 * Delete a cookie by expiring it immediately
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Retrieve all readable client cookies as a key-value record
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const cookies: Record<string, string> = {};
  const pairs = document.cookie.split(";");

  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = decodeURIComponent(trimmed.slice(0, eqIdx));
      const val = decodeURIComponent(trimmed.slice(eqIdx + 1));
      cookies[key] = val;
    }
  }
  return cookies;
}

/**
 * Parse the client session state cookie issued by the server
 */
export function getClientSession(): ClientSessionData | null {
  const raw = getCookie("krono_client_session");
  if (!raw) return null;

  try {
    // Check if Base64 encoded
    const jsonStr = typeof atob === "function" ? atob(raw) : decodeURIComponent(raw);
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.userId && parsed.expiresAt) {
      if (parsed.expiresAt <= Date.now()) {
        deleteCookie("krono_client_session");
        return null;
      }
      return parsed as ClientSessionData;
    }
  } catch {
    // If not base64, try direct JSON
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      return parsed as ClientSessionData;
    } catch {}
  }
  return null;
}

/**
 * Check whether a valid client session exists
 */
export function hasActiveSession(): boolean {
  const session = getClientSession();
  if (session && session.expiresAt > Date.now()) return true;
  return !!getCookie("krono_token");
}
