"use client";

import { useEffect } from "react";

/**
 * ThemeInitializer - Apply cached theme colors as early as possible
 * This component should run as soon as possible to prevent color flash
 */
export function ThemeInitializer() {
  useEffect(() => {
    // Apply cached colors immediately (runs after hydration)
    initializeTheme();
  }, []);

  return null;
}

/**
 * Initialize theme colors from cache
 * Reads business settings from localStorage and applies primary color immediately
 */
function initializeTheme() {
  try {
    const BUSINESS_SETTINGS_CACHE_KEY = "businessSettings_cache";

    // Try to get cached business settings from localStorage
    const cachedSettingsStr = localStorage.getItem(BUSINESS_SETTINGS_CACHE_KEY);

    if (!cachedSettingsStr) {
      return;
    }

    try {
      const cachedSettings = JSON.parse(cachedSettingsStr);
      const primaryColor = cachedSettings?.primaryColor;

      if (!primaryColor) {
        return;
      }

      // Apply colors immediately
      applyThemeColorsSync(primaryColor);
    } catch (e) {
      console.error("[THEME] Failed to parse cached settings:", e);
    }
  } catch (error) {
    console.error("[THEME INIT] Error initializing theme:", error);
  }
}

/**
 * Apply theme colors synchronously (hex to HSL conversion)
 */
function applyThemeColorsSync(primaryColor?: string): void {
  const hexToHsl = (hex: string): string => {
    if (!hex || !hex.startsWith("#")) return "";

    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    const hue = Math.round(h * 360);
    const saturation = Math.round(s * 100);
    const lightness = Math.round(l * 100);

    return `${hue} ${saturation}% ${lightness}%`;
  };

  if (primaryColor) {
    const hsl = hexToHsl(primaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--primary", hsl);
    }
  }
}
