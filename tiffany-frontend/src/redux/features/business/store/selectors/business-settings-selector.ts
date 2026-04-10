import { RootState } from '@/redux/store/types';
import { createSelector } from "@reduxjs/toolkit";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.systemName || "Tiffany Cambodia";

export const selectBusinessDescription = (state: RootState) =>
  state.businessSettings.data?.description || "";

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoSystemUrl || null;

export const selectTaxPercentage = (state: RootState) =>
  state.businessSettings.data?.taxPercentage || 0;

export const selectContactAddress = (state: RootState) =>
  state.businessSettings.data?.contactAddress || "";

export const selectContactPhone = (state: RootState) =>
  state.businessSettings.data?.contactPhone || "";

export const selectContactEmail = (state: RootState) =>
  state.businessSettings.data?.contactEmail || "";

export const selectSocialMedia = (state: RootState) =>
  state.businessSettings.data?.socialMedia || [];

export const selectBusinessHours = (state: RootState) =>
  state.businessSettings.data?.businessHours || [];

export const selectPrimaryColor = (state: RootState) =>
  state.businessSettings.data?.primaryColor || "#57823D";

export const selectBusinessColors = createSelector(
  (state: RootState) => state.businessSettings.data?.primaryColor || "#57823D",
  (primaryColor) => ({
    primary: primaryColor,
  })
);
