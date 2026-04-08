import { useState, useCallback } from "react";

export interface SocialMedia {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  systemSettingId: string;
  name: string;
  linkUrl: string;
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

export interface BusinessSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  taxPercentage: number;
  systemName: string;
  logoSystemUrl: string | null;
  primaryColor: string | null;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  socialMedia: SocialMedia[];
  businessHours: BusinessHours[];
}

export interface UpdateBusinessSettingsPayload {
  taxPercentage?: number;
  systemName?: string;
  logoSystemUrl?: string | null;
  primaryColor?: string | null;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialMedia?: SocialMedia[];
  businessHours?: BusinessHours[];
}

/**
 * Custom hook for managing business settings
 * Handles fetching and updating business settings
 */
export const useBusinessSettings = () => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current business settings
   */
  const fetchBusinessSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/v1/system-settings");
      if (!response.ok) {
        throw new Error("Failed to fetch business settings");
      }

      const result = await response.json();
      const data = result.data || result;
      setBusinessSettings(data);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update business settings
   */
  const updateBusinessSettings = useCallback(
    async (payload: UpdateBusinessSettingsPayload): Promise<BusinessSettings> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = await fetch("/api/v1/system-settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to update business settings");
        }

        const result = await response.json();
        const data = result.data || result;
        setBusinessSettings(data);

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    businessSettings,
    isLoading,
    isSaving,
    error,
    fetchBusinessSettings,
    updateBusinessSettings,
    clearError,
  };
};
