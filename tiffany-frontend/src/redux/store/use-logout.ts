"use client";

import { useCallback } from "react";
import { useAppDispatch } from '@/redux/store/hooks';
import { logoutService } from "@/redux/features/auth/store/thunks/auth-thunks";
import { logout } from "@/redux/features/auth/store/slice/auth-slice";
import { resetCart } from "@/redux/features/main/store/slice/cart-slice";
import { resetFavorites } from "@/redux/features/main/store/slice/favorite-slice";
import { clearOrders } from "@/redux/features/main/store/slice/my-orders-slice";

export function useLogout() {
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutService()).unwrap();
    } catch {
      dispatch(logout());
    } finally {
      // Clear all customer-related Redux state
      dispatch(resetCart());
      dispatch(resetFavorites());
      dispatch(clearOrders());
      // Redirect to home and hard-refresh to clear any remaining state
      window.location.href = "/";
    }
  }, [dispatch]);

  return { logout: handleLogout };
}
