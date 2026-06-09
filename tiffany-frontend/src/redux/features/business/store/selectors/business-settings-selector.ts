import { RootState } from "@/redux/store/types";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

export const selectBusinessDescription = (state: RootState) =>
  state.businessSettings.data?.description || "";

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
