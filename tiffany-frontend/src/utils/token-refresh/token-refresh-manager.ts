/**
 * Token Refresh Manager
 * Handles proactive token refresh before expiry
 * Works for both CUSTOMER and OWNER (admin) token types
 */

import {
  getToken,
  getAdminToken,
  getRefreshToken,
  getAdminRefreshToken,
  storeTokens,
  storeAdminTokens,
  isTokenExpired,
  isAdminTokenExpired,
  getUserTypeFromToken,
  decodeToken,
} from "@/utils/local-storage/token";

interface TokenRefreshOptions {
  /** Buffer time in seconds before actual expiry to trigger refresh (default: 300s = 5 minutes) */
  bufferSeconds?: number;
  /** Check interval in milliseconds (default: 60000ms = 1 minute) */
  checkIntervalMs?: number;
  /** Callback when token is refreshed */
  onTokenRefreshed?: (userType: "CUSTOMER" | "OWNER") => void;
  /** Callback when refresh fails */
  onRefreshFailed?: (error: unknown) => void;
}

/**
 * Manages proactive token refresh for both customer and owner sessions
 */
export class TokenRefreshManager {
  private refreshCheckIntervalId: NodeJS.Timeout | null = null;
  private bufferSeconds: number;
  private checkIntervalMs: number;
  private onTokenRefreshed?: (userType: "CUSTOMER" | "OWNER") => void;
  private onRefreshFailed?: (error: unknown) => void;
  private isRefreshing = false;

  constructor(options: TokenRefreshOptions = {}) {
    this.bufferSeconds = options.bufferSeconds || 300; // 5 minutes before expiry
    this.checkIntervalMs = options.checkIntervalMs || 60000; // Check every 1 minute
    this.onTokenRefreshed = options.onTokenRefreshed;
    this.onRefreshFailed = options.onRefreshFailed;
  }

  /**
   * Start proactive token refresh monitoring
   */
  start(): void {
    if (typeof window === "undefined") return;

    if (this.refreshCheckIntervalId) {
      console.warn("TokenRefreshManager: Already started");
      return;
    }


    this.refreshCheckIntervalId = setInterval(() => {
      this.checkAndRefreshTokens();
    }, this.checkIntervalMs);

    // Check immediately on start
    this.checkAndRefreshTokens();
  }

  /**
   * Stop proactive token refresh monitoring
   */
  stop(): void {
    if (this.refreshCheckIntervalId) {
      clearInterval(this.refreshCheckIntervalId);
      this.refreshCheckIntervalId = null;
    }
  }

  /**
   * Check and refresh tokens if needed
   */
  private async checkAndRefreshTokens(): Promise<void> {
    if (this.isRefreshing) return;

    try {
      // Check customer token
      if (isTokenExpired(this.bufferSeconds)) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          await this.refreshToken(refreshToken, "CUSTOMER");
        }
      }

      // Check admin/owner token
      if (isAdminTokenExpired(this.bufferSeconds)) {
        const refreshToken = getAdminRefreshToken();
        if (refreshToken) {
          await this.refreshToken(refreshToken, "OWNER");
        }
      }
    } catch (error) {
      console.error("TokenRefreshManager: Error during token check", error);
    }
  }

  /**
   * Refresh a specific token
   */
  private async refreshToken(
    refreshToken: string,
    expectedUserType: "CUSTOMER" | "OWNER"
  ): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Token refresh failed with status ${response.status}`
        );
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data.data;

      // Verify the token matches expected user type
      const actualUserType = getUserTypeFromToken(newAccessToken);
      if (actualUserType !== expectedUserType) {
        console.warn(
          `TokenRefreshManager: User type mismatch. Expected ${expectedUserType}, got ${actualUserType}`
        );
      }

      // Store tokens in correct location
      if (actualUserType === "OWNER") {
        storeAdminTokens(newAccessToken, newRefreshToken);
      } else {
        storeTokens(newAccessToken, newRefreshToken);
      }

      this.onTokenRefreshed?.(actualUserType as "CUSTOMER" | "OWNER");
    } catch (error) {
      console.error(
        `TokenRefreshManager: Failed to refresh ${expectedUserType} token`,
        error
      );
      this.onRefreshFailed?.(error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get token expiry time for monitoring
   */
  getTokenExpiry(userType: "CUSTOMER" | "OWNER"): Date | null {
    try {
      const token = userType === "OWNER" ? getAdminToken() : getToken();
      if (!token) return null;

      const decoded = decodeToken(token);
      if (!decoded?.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Get time until token expiry
   */
  getTimeUntilExpiry(userType: "CUSTOMER" | "OWNER"): number | null {
    const expiry = this.getTokenExpiry(userType);
    if (!expiry) return null;

    return Math.floor((expiry.getTime() - Date.now()) / 1000);
  }

  /**
   * Get current status of token refresh manager
   */
  getStatus(): {
    isRunning: boolean;
    customerTokenExpiry: Date | null;
    ownerTokenExpiry: Date | null;
    customerTimeToExpiry: number | null;
    ownerTimeToExpiry: number | null;
    bufferSeconds: number;
    checkIntervalMs: number;
  } {
    return {
      isRunning: !!this.refreshCheckIntervalId,
      customerTokenExpiry: this.getTokenExpiry("CUSTOMER"),
      ownerTokenExpiry: this.getTokenExpiry("OWNER"),
      customerTimeToExpiry: this.getTimeUntilExpiry("CUSTOMER"),
      ownerTimeToExpiry: this.getTimeUntilExpiry("OWNER"),
      bufferSeconds: this.bufferSeconds,
      checkIntervalMs: this.checkIntervalMs,
    };
  }
}

// Global singleton instance
let globalTokenRefreshManager: TokenRefreshManager | null = null;

/**
 * Get or create the global token refresh manager
 */
export function getTokenRefreshManager(
  options?: TokenRefreshOptions
): TokenRefreshManager {
  if (!globalTokenRefreshManager) {
    globalTokenRefreshManager = new TokenRefreshManager(options);
  }
  return globalTokenRefreshManager;
}

/**
 * Initialize token refresh manager with default options
 */
export function initializeTokenRefresh(
  options?: TokenRefreshOptions
): TokenRefreshManager {
  const manager = getTokenRefreshManager(options);
  manager.start();
  return manager;
}
