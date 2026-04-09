// components/providers/auth-provider.tsx
"use client";

import { useAuthInit } from "@/redux/store/use-auth-init";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth from cookies on every route change
  useAuthInit();

  // Start proactive token refresh (monitors both customer and owner tokens)
  useTokenRefresh();

  return <>{children}</>;
}
