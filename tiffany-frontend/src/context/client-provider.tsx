"use client";

import "react-toastify/dist/ReactToastify.css";
import { ReactNode, StrictMode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import store from "../redux/store";
import { ToastContainer } from "react-toastify";
import { useBusinessTheme, initializeBusinessThemeFromCache } from "@/hooks/use-business-theme";

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

export function ClientProviders({ children }: ClientProvidersProps) {
  const isProduction = process.env.NODE_ENV === "production";

  const content = (
    <Provider store={store}>
      <ThemeInitializer />
      {children}
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
  // (it's still useful for production debugging if needed)
  return isProduction ? (
    <StrictMode>{content}</StrictMode>
  ) : (
    content
  );
}
