"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store/configure";
import { ToastContainer } from "react-toastify";
import { useBusinessTheme, initializeBusinessThemeFromCache } from "@/hooks/use-business-theme";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useAppDispatch } from '@/redux/store/hooks';
import { fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { AuthModalProvider } from "@/context/auth-modal-context";

interface ClientProvidersProps {
  children: ReactNode;
}

// Theme provider component - initializes from cache then fetches fresh data in background
function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme from cache on client side only
    initializeBusinessThemeFromCache();
  }, []);

  useBusinessTheme();
  return null;
}

// Global app initializer - ensures data is restored on navigation
function AppInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, authReady } = useAuthState();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cart is only needed for customer-facing routes, not admin
    // window.location is safe here since useEffect is client-only
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    if (authReady && isAuthenticated && !isAdminRoute) {
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
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <AuthModalProvider>
        <AppInitializer>
          {children}
        </AppInitializer>
      </AuthModalProvider>
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
}
