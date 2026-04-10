import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

// Native browser cookie API (works reliably on client-side)
function setNativeCookie(name: string, value: string, maxAge: number): void {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + maxAge);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
}

function deleteNativeCookie(name: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// Cookie names - use centralized constants
const ACCESS_TOKEN_KEY = COOKIE_KEYS.ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = COOKIE_KEYS.REFRESH_TOKEN;

/**
 * Calculate maxAge in seconds from a JWT token's exp claim.
 * Falls back to the provided default if decoding fails.
 */
function getMaxAgeFromToken(
  token: string,
  fallbackSeconds: number
): number {
  try {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      // Use the remaining time if it's positive, otherwise use fallback
      if (remaining > 0) return remaining;
    }
  } catch {
    // ignore decode errors
  }
  return fallbackSeconds;
}

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }

  const maxAge = getMaxAgeFromToken(token, 365 * 24 * 60 * 60);
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // Try cookie first
  const cookieToken = getCookie(ACCESS_TOKEN_KEY);
  if (cookieToken) return cookieToken as string;

  // Fallback to localStorage if cookie not found
  const localToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (localToken) return localToken;

  return undefined;
}

/**
 * Store access token with expiry matching the JWT exp claim
 */
export function storeToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }

  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60); // fallback: 7 days

  // Store in both cookie and localStorage for reliability
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * Store refresh token with expiry matching the JWT exp claim
 */
export function storeRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) {
    return;
  }

  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60); // fallback: 30 days

  // Store in both cookie and localStorage for reliability
  setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge, path: "/" });
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Get refresh token from cookie or localStorage
 */
export function getRefreshToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // Try cookie first
  const cookieToken = getCookie(REFRESH_TOKEN_KEY);
  if (cookieToken) return cookieToken as string;

  // Fallback to localStorage if cookie not found
  const localToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (localToken) return localToken;

  return undefined;
}

/**
 * Store both access and refresh tokens with expiry from JWT exp claims
 */
export function storeTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeToken(accessToken);
  storeRefreshToken(refreshToken);
}

/**
 * Logout the current user
 */
export function clearToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Clear refresh token
 */
export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all authentication tokens
 */
export function clearAllTokens(): void {
  clearToken();
  clearRefreshToken();
}

// ─── Admin (BUSINESS_USER) token helpers ────────────────────────────────────

export function storeAdminToken(token: string | undefined): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = getMaxAgeFromToken(token, 7 * 24 * 60 * 60);
  setNativeCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN, token, maxAge);
  localStorage.setItem(COOKIE_KEYS.ADMIN_ACCESS_TOKEN, token);
}

export function storeAdminRefreshToken(refreshToken: string | undefined): void {
  if (typeof window === "undefined" || !refreshToken) return;
  const maxAge = getMaxAgeFromToken(refreshToken, 30 * 24 * 60 * 60);
  setNativeCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN, refreshToken, maxAge);
  localStorage.setItem(COOKIE_KEYS.ADMIN_REFRESH_TOKEN, refreshToken);
}

export function storeAdminTokens(
  accessToken: string | undefined,
  refreshToken: string | undefined
): void {
  storeAdminToken(accessToken);
  storeAdminRefreshToken(refreshToken);
}

export function getAdminToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // Try cookie first
  const cookieToken = getCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
  if (cookieToken) return cookieToken as string;

  // Fallback to localStorage if cookie not found
  const localToken = localStorage.getItem(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
  if (localToken) return localToken;

  return undefined;
}

export function getAdminRefreshToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // Try cookie first
  const cookieToken = getCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN);
  if (cookieToken) return cookieToken as string;

  // Fallback to localStorage if cookie not found
  const localToken = localStorage.getItem(COOKIE_KEYS.ADMIN_REFRESH_TOKEN);
  if (localToken) return localToken;

  return undefined;
}

export function clearAdminTokens(): void {
  deleteNativeCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
  deleteNativeCookie(COOKIE_KEYS.ADMIN_REFRESH_TOKEN);
  localStorage.removeItem(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
  localStorage.removeItem(COOKIE_KEYS.ADMIN_REFRESH_TOKEN);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return !!token;
}

/**
 * Check if refresh token exists
 */
export function hasRefreshToken(): boolean {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return !!token;
}

/**
 * Decode JWT token to get payload (without verification)
 */
export function decodeToken(token: string): {
  sub?: string;
  userId?: string;
  userType?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if access token is expired or about to expire
 * @param bufferSeconds - seconds before actual expiry to consider as expired (default 5 minutes)
 */
export function isTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}

/**
 * Check if admin access token is expired or about to expire
 * @param bufferSeconds - seconds before actual expiry to consider as expired (default 5 minutes)
 */
export function isAdminTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getAdminToken();
  if (!token) return true;

  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}

/**
 * Get the userType from a token (CUSTOMER or OWNER)
 */
export function getUserTypeFromToken(token?: string): string | null {
  if (!token) return null;
  const decoded = decodeToken(token);
  return decoded?.userType || null;
}

/**
 * Get userType from the currently active token based on route
 */
export function getActiveUserType(): "CUSTOMER" | "OWNER" | null {
  if (typeof window === "undefined") return null;

  const isAdminPath = window.location.pathname.startsWith("/admin");
  const tokenToCheck = isAdminPath ? getAdminToken() : getToken();

  const userType = getUserTypeFromToken(tokenToCheck);
  return userType as "CUSTOMER" | "OWNER" | null;
}
