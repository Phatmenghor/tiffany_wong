/**
 * Business Profile Types
 * Multi-tenant business portfolio system
 */

import {
  BusinessType,
  ContactInfo,
  SocialMediaLinks,
  BusinessHours,
  GalleryItem,
  Service,
  TeamMember,
  CustomerReview,
  ThemeSettings,
  ProfileSectionSettings,
} from './index';

export interface BusinessProfile {
  // Basic Information
  id: string;
  slug: string; // URL-friendly identifier (e.g., "my-coffee-shop")
  businessName: string;
  tagline?: string;
  description: string;
  logo?: string;
  coverImage?: string;

  // Business Type & Industry
  businessType: BusinessType;
  industry: string;

  // Contact Information
  contact: ContactInfo;

  // Social Media
  socialMedia?: SocialMediaLinks;

  // Business Hours
  businessHours?: BusinessHours[];

  // Gallery
  gallery?: GalleryItem[];

  // Features & Services
  features?: string[];
  services?: Service[];

  // Team Members
  team?: TeamMember[];

  // Customer Reviews (Enhanced)
  reviews?: CustomerReview[];

  // Stats/Achievements
  stats?: BusinessStats;

  // Theme & Customization
  theme?: ThemeSettings;

  // Visibility & Settings
  isPublished: boolean;
  customDomain?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface BusinessStats {
  yearsInBusiness?: number;
  customersServed?: number;
  projectsCompleted?: number;
  productsAvailable?: number;
  customStats?: any[];
}

// Form data for editing
export interface BusinessProfileFormData {
  businessName: string;
  tagline: string;
  description: string;
  businessType: BusinessType;
  industry: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  website: string;
}

// System Admin Settings (extends BusinessProfile)
export interface SystemAdminSettings extends BusinessProfile {
  id: string;
  slug: string;
}

export interface SystemAdminFormData {
  businessName: string;
  tagline: string;
  description: string;
  businessType: BusinessType;
  industry: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  website: string;
}
