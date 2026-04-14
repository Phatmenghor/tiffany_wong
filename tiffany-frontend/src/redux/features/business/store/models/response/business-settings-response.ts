/**
 * Business Settings Response Model
 * Response from /api/v1/system-settings
 * @deprecated Use the response types from business-settings-service.ts instead
 */

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
  description: string | null;
  logoSystemUrl: string | null;
  primaryColor: string | null;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  socialMedia: SocialMedia[];
  businessHours: BusinessHours[];
}
