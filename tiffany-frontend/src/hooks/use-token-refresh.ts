"use client";

import { useEffect, useRef } from "react";
import {
  TokenRefreshManager,
  initializeTokenRefresh,
} from "@/utils/token-refresh/token-refresh-manager";

/**
 * Hook to manage proactive token refresh
 * Should be used once in a root layout or app provider
 *
 * Example:
 * export default function RootLayout({ children }) {
 *   useTokenRefresh();
 *   return <>{children}</>;
 * }
 */
export function useTokenRefresh() {
  const managerRef = useRef<TokenRefreshManager | null>(null);

  useEffect(() => {
    // Initialize token refresh manager on client side only
    if (typeof window !== "undefined" && !managerRef.current) {
      managerRef.current = initializeTokenRefresh({
        bufferSeconds: 300, // Refresh 5 minutes before expiry
        checkIntervalMs: 60000, // Check every 1 minute
        onTokenRefreshed: (userType) => {
          console.log(
            `✅ Token auto-refreshed for ${userType === "OWNER" ? "admin" : "customer"}`
          );
        },
        onRefreshFailed: (error) => {
          console.warn("⚠️ Token refresh failed:", error);
        },
      });

      console.log("🔄 Token refresh manager initialized");

      // Log token status on startup
      const status = managerRef.current.getStatus();
      console.log("📊 Token Status:", {
        customerExpiresIn: status.customerTimeToExpiry
          ? `${status.customerTimeToExpiry}s`
          : "No token",
        ownerExpiresIn: status.ownerTimeToExpiry
          ? `${status.ownerTimeToExpiry}s`
          : "No token",
      });
    }

    // Cleanup on unmount (but don't stop manager - it should stay active)
    return () => {
      // Don't stop the manager on unmount since it's a global service
      // It will run throughout the app lifecycle
    };
  }, []);
}
