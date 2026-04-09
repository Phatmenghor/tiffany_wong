import { createSlice } from "@reduxjs/toolkit";
import { BusinessSettingsState, initialBusinessSettingsState } from "../state/business-settings-state";
import {
  fetchBusinessSettingsThunk,
  updateBusinessSettingsThunk,
} from "../thunks/business-settings-thunks";

// Cache key for localStorage
const BUSINESS_SETTINGS_CACHE_KEY = "businessSettings_cache";

// Load cached business settings from localStorage
const loadCachedSettings = () => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(BUSINESS_SETTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error loading cached business settings:", error);
    return null;
  }
};

// Save business settings to localStorage cache
const cacheSetting = (data: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BUSINESS_SETTINGS_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error caching business settings:", error);
  }
};

// Initialize with cached data if available
const initialState: BusinessSettingsState = {
  ...initialBusinessSettingsState,
  data: loadCachedSettings() || initialBusinessSettingsState.data,
};

const businessSettingsSlice = createSlice({
  name: "businessSettings",
  initialState,
  reducers: {
    /**
     * Clear business settings
     */
    clearBusinessSettings: (state) => {
      state.data = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchBusinessSettingsThunk
    builder
      .addCase(fetchBusinessSettingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessSettingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
        // Cache the settings for instant loading on next page refresh
        cacheSetting(action.payload);
      })
      .addCase(fetchBusinessSettingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.data = null;
      });

    // Handle updateBusinessSettingsThunk
    builder
      .addCase(updateBusinessSettingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBusinessSettingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = null;
        // Cache the updated settings
        cacheSetting(action.payload);
      })
      .addCase(updateBusinessSettingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBusinessSettings } = businessSettingsSlice.actions;

export default businessSettingsSlice.reducer;
