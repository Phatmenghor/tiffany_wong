import { RootState } from "@/redux/store/types";
import { createSelector } from "@reduxjs/toolkit";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.systemName || BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME;

export const selectBusinessDescription = (state: RootState) =>
  state.businessSettings.data?.description || "";

export const selectTaxPercentage = (state: RootState) =>
  state.businessSettings.data?.taxPercentage ?? BUSINESS_SETTINGS_DEFAULTS.TAX_PERCENTAGE;

export const selectContactAddress = (state: RootState) =>
  state.businessSettings.data?.contactAddress || "";

export const selectContactPhone = (state: RootState) =>
  state.businessSettings.data?.contactPhone || "";

export const selectContactEmail = (state: RootState) =>
  state.businessSettings.data?.contactEmail || "";

export const selectFacebookUrl = (state: RootState) =>
  state.businessSettings.data?.facebookUrl || "";

export const selectInstagramUrl = (state: RootState) =>
  state.businessSettings.data?.instagramUrl || "";

export const selectTelegramUrl = (state: RootState) =>
  state.businessSettings.data?.telegramUrl || "";

export const selectPrimaryColor = (state: RootState) =>
  state.businessSettings.data?.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR;

export const selectBusinessColors = createSelector(
  (state: RootState) =>
    state.businessSettings.data?.primaryColor || BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
  (primaryColor) => ({ primary: primaryColor })
);
