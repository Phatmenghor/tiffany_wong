/**
 * System Settings API Service
 */

import { axiosClient, axiosClientWithAuth } from "@/utils/axios/axios-client";

export interface BusinessSettingsResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  taxPercentage: number;
  systemName: string;
  description?: string | null;
  primaryColor: string | null;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  telegramUrl?: string | null;
}

export interface UpdateBusinessSettingsRequest {
  taxPercentage?: number;
  systemName?: string;
  description?: string | null;
  primaryColor?: string | null;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  telegramUrl?: string | null;
}

const API_BASE_URL = "/api/v1/system-settings";

export const fetchBusinessSettingsByBusinessId = async (): Promise<BusinessSettingsResponse> => {
  const response = await axiosClient.get<{ data: BusinessSettingsResponse }>(API_BASE_URL);
  return response.data.data;
};

export const updateCurrentBusinessSettings = async (
  request: UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  const response = await axiosClientWithAuth.put<{ data: BusinessSettingsResponse }>(
    API_BASE_URL,
    request
  );
  return response.data.data;
};
