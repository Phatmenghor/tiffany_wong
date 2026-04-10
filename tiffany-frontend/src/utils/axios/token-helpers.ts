/**
 * Token Management Helpers
 * Functions for managing authentication tokens and routes
 */

import {
  getToken,
  getAdminToken,
  getRefreshToken,
  getAdminRefreshToken,
  getUserTypeFromToken,
} from "../local-storage/token";

/**
 * Get the correct token based on current route
 */
export const getActiveToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  // Use admin token for admin routes, customer token for public routes
  if (isAdminPath()) {
    return getAdminToken();
  }
  return getToken();
};

/**
 * Get the correct refresh token based on current route
 */
export const getActiveRefreshToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  // Match the token type based on current route
  if (isAdminPath()) {
    return getAdminRefreshToken();
  }
  return getRefreshToken();
};

/**
 * Check if the active user is OWNER based on JWT userType claim
 * This is more reliable than checking the route path
 */
export const isAdminUser = (): boolean => {
  if (typeof window === "undefined") return false;

  // Try admin token first (if on admin route)
  const adminToken = getAdminToken();
  if (adminToken) {
    const userType = getUserTypeFromToken(adminToken);
    if (userType === "OWNER") return true;
  }

  // Try customer token
  const customerToken = getToken();
  if (customerToken) {
    const userType = getUserTypeFromToken(customerToken);
    if (userType === "OWNER") return true;
  }

  return false;
};

/**
 * True when the current page is an admin route (browser only).
 */
export const isAdminPath = (): boolean =>
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/admin");
