/**
 * System Settings API Service
 * Handles API calls for system settings endpoints
 */

import { axiosClient, axiosClientWithAuth } from "@/utils/axios/axios-client";

export interface SocialMedia {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  systemSettingId: string;
  name: string;
  linkUrl: string;
  iconUrl?: string;
}

export interface BusinessHours {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  day: string;
  openingTime: string;
  closingTime: string;
}

export interface BusinessSettingsResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  taxPercentage: number;
  systemName: string;
  description?: string | null;
  logoSystemUrl: string | null;
  primaryColor: string | null;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  socialMedia: SocialMedia[];
  businessHours: BusinessHours[];
}

export interface UpdateBusinessSettingsRequest {
  taxPercentage?: number;
  systemName?: string;
  description?: string | null;
  logoSystemUrl?: string | null;
  primaryColor?: string | null;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialMedia?: SocialMedia[];
  businessHours?: BusinessHours[];
}

const API_BASE_URL = "/api/v1/system-settings";

/**
 * Fetch system settings (Public - No Auth Required)
 * Fetches system theme colors, logo, and system name
 * GET /api/v1/system-settings
 *
 * Used for:
 * - Loading system theme on app startup
 * - Displaying system branding (logo, colors, name)
 * - Guest users and public pages
 *
 * @returns System settings response with theme colors and branding info
 */
export const fetchBusinessSettingsByBusinessId = async (
  businessId?: string
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClient.get<{ data: BusinessSettingsResponse }>(
      API_BASE_URL
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw error;
  }
};

/**
 * Update current system settings
 * PUT /api/v1/system-settings
 */
export const updateCurrentBusinessSettings = async (
  request: UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.put<{ data: BusinessSettingsResponse }>(
      API_BASE_URL,
      request
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw error;
  }
};

/**
 * Create business settings
 * POST /api/v1/business-settings
 */
export const createBusinessSettings = async (
  request: {
    businessId: string;
  } & UpdateBusinessSettingsRequest
): Promise<BusinessSettingsResponse> => {
  try {
    const response = await axiosClientWithAuth.post<{ data: BusinessSettingsResponse }>(
      API_BASE_URL,
      request
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating business settings:", error);
    throw error;
  }
};

/**
 * Delete business settings
 * DELETE /api/v1/business-settings/business/{businessId}
 */
export const deleteBusinessSettings = async (businessId: string): Promise<void> => {
  try {
    await axiosClientWithAuth.delete(`${API_BASE_URL}/business/${businessId}`);
  } catch (error) {
    console.error(`Error deleting business settings for ${businessId}:`, error);
    throw error;
  }
};
