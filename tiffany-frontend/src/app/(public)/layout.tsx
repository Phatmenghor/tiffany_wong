"use client";

import { Suspense, useEffect, useRef } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { fetchCart } from "@/redux/features/main/store/thunks/cart-thunks";
import { fetchFavoriteList } from "@/redux/features/main/store/thunks/favorite-thunks";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthState();
  const {
    dispatch: cartDispatch,
    loaded: cartLoaded,
  } = useCartState();
  const {
    dispatch: favoriteDispatch,
    loaded: favoriteLoaded,
  } = useFavoriteState();

  const cartFetchAttempted = useRef(false);
  const favoriteFetchAttempted = useRef(false);

  // Reset attempt flags when user logs out so next login re-fetches
  useEffect(() => {
    if (!isAuthenticated) {
      cartFetchAttempted.current = false;
      favoriteFetchAttempted.current = false;
    }
  }, [isAuthenticated]);

  // Load cart and favorites once when user is authenticated — never retry on failure
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!cartLoaded && !cartFetchAttempted.current) {
      cartFetchAttempted.current = true;
      cartDispatch(fetchCart());
    }
    if (!favoriteLoaded && !favoriteFetchAttempted.current) {
      favoriteFetchAttempted.current = true;
      favoriteDispatch(fetchFavoriteList());
    }
  }, [isAuthenticated, cartLoaded, favoriteLoaded, cartDispatch, favoriteDispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* pb-nav-safe = nav height (2.6rem) + iPhone safe-area inset on mobile;
          falls back to plain sm:pb-0 on larger screens. */}
      <main className="flex-1 pb-nav-safe sm:pb-0">
        <Suspense>{children}</Suspense>
      </main>

      {/* Footer — hidden on mobile (replaced by bottom nav) */}
      <div className="hidden sm:block">
        <Footer />
      </div>

      {/* Native-style bottom tab bar — mobile only */}
      <BottomNav />
    </div>
  );
}
