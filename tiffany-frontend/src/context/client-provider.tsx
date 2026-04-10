"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode, StrictMode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store";
import { ToastContainer } from "react-toastify";
import { useBusinessTheme, initializeBusinessThemeFromCache } from "@/hooks/use-business-theme";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAppDispatch } from "@/redux/store";
import { fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";

interface ClientProvidersProps {
  children: ReactNode;
}

// Initialize theme colors from cache SYNCHRONOUSLY before rendering
// This ensures colors are applied instantly without waiting for API
if (typeof window !== "undefined") {
  initializeBusinessThemeFromCache();
}

// Theme provider component - fetches fresh data in background
function ThemeInitializer() {
  useBusinessTheme();
  return null;
}

// Global app initializer - ensures data is restored on navigation
function AppInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Restore cart data when app is ready
    if (authReady && isAuthenticated) {
      dispatch(fetchCart()).finally(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, [authReady, isAuthenticated, dispatch]);

  return <>{children}</>;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const isProduction = process.env.NODE_ENV === "production";

  const content = (
    <Provider store={store}>
      <ThemeInitializer />
      <AppInitializer>
        {children}
      </AppInitializer>
      <Toaster />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Provider>
  );

  // Disable StrictMode in development to avoid double-mounting
  return isProduction ? (
    <StrictMode>{content}</StrictMode>
  ) : (
    content
  );
}
