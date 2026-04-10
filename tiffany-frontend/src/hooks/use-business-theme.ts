import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from '@/redux/store/hooks';
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged } from "@/utils/common/theme-cache";
import { AppDefault } from "@/constants/app-resource/default/default";
import store from '@/redux/store/configure';

// Default brand colors from tailwind config
const DEFAULT_COLORS = {
  primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
};

// Cache key for full business settings
const BUSINESS_SETTINGS_CACHE_KEY = "businessSettings_full_cache";

/**
 * Load cached business settings from localStorage
 */
function getCachedBusinessSettings(): BusinessSettingsResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(BUSINESS_SETTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("## [THEME] Error loading cached business settings:", error);
    return null;
  }
}

/**
 * Save business settings to localStorage cache
 */
function cacheBusinessSettings(settings: BusinessSettingsResponse) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUSINESS_SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("## [THEME] Error caching business settings:", error);
  }
}

/**
 * Convert hex color to HSL format for CSS variables
 */
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
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
}

/**
 * Initialize business settings and theme SYNCHRONOUSLY from cache
 * This runs before the page renders, so theme is applied instantly
 */
export function initializeBusinessThemeFromCache() {
  const SYSTEM_ID = "system-settings";

  // Load and apply colors from cache synchronously (instant, before page renders)
  const cachedColors = getCachedThemeColors(SYSTEM_ID);
  if (cachedColors) {
    applyColors(cachedColors.primaryColor);
  } else {
    applyColors(DEFAULT_COLORS.primary);
  }
}

/**
 * Hook to initialize business theme from settings
 * Fetches system settings on app startup (BEFORE auth)
 * System settings are global and used across ALL routes
 *
 * NOTE: This hook now handles browser navigation/back button by:
 * - Fetching data on every mount
 * - Setting up a popstate listener to refetch on back button
 * - Caching data to localStorage for instant recovery
 */
export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const SYSTEM_ID = "system-settings";

  // Fetch business settings on component mount
  const fetchSettings = () => {
    dispatch(fetchBusinessSettingsThunk()).then((action) => {
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const payload = action.payload as BusinessSettingsResponse;

        // Cache the settings
        cacheBusinessSettings(payload);

        // Cache the colors
        const colors = {
          primaryColor: payload.primaryColor || "",
        };
        cacheThemeColors(SYSTEM_ID, colors);

        // Apply colors
        if (payload.primaryColor) {
          applyColors(payload.primaryColor);
        }
      }
    });
  };

  useEffect(() => {
    // Fetch on initial mount
    fetchSettings();

    // Add listener for browser back/forward buttons
    const handlePopState = () => {
      fetchSettings();
    };

    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [dispatch]);
}

/**
 * Helper function to apply primary color to CSS variables
 */
function applyColors(primaryColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;

  if (primary) {
    document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  }
}
