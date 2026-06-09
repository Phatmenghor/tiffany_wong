import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store/hooks";
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

/**
 * Convert hex color to HSL format for CSS custom properties
 */
function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Apply the brand primary color to CSS variables.
 * To change the brand color, update BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR
 * in src/constants/business-settings.ts.
 */
function applyPrimaryColor(): void {
  if (typeof document === "undefined") return;
  const hsl = hexToHsl(BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR);
  document.documentElement.style.setProperty("--primary", hsl);
}

/**
 * Called synchronously before first render to avoid flash of wrong color.
 * Uses the frontend constant — no network request or cache needed.
 */
export function initializeBusinessThemeFromCache() {
  applyPrimaryColor();
}

/**
 * Hook that fetches business settings on mount and keeps Redux state fresh.
 * Theme color is applied from the frontend constant immediately — no caching.
 */
export function useBusinessTheme() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Apply color immediately from constant (no flash)
    applyPrimaryColor();

    // Fetch fresh settings into Redux store for contact info and social links.
    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch]);
}
