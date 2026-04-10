/**
 * Authentication Helper Functions
 * Handles token management and user type detection
 */

import {
  getToken,
  getAdminToken,
  getRefreshToken,
  getAdminRefreshToken,
  getUserTypeFromToken,
} from "../local-storage/token";

/**
 * Check if the current page is an admin route (browser only)
 */
export const isAdminPath = (): boolean =>
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/admin");

/**
 * Get the correct token based on current route
 */
export const getActiveToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

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

  const adminToken = getAdminToken();
  if (adminToken) {
    const userType = getUserTypeFromToken(adminToken);
    if (userType === "OWNER") return true;
  }

  const customerToken = getToken();
  if (customerToken) {
    const userType = getUserTypeFromToken(customerToken);
    if (userType === "OWNER") return true;
  }

  return false;
};
