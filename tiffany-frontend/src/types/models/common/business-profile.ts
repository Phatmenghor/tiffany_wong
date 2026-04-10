/**
 * Business Profile Types
 * Multi-tenant business portfolio system
 */

// Type definitions (previously in index.ts)
export type BusinessType = string;
export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}
export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}
export interface BusinessHours {
  day: string;
  open: string;
  close: string;
}
export interface GalleryItem {
  id: string;
  url: string;
  title?: string;
}
export interface Service {
  id: string;
  name: string;
  description?: string;
  price?: number;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}
export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}
export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
}
export interface ProfileSectionSettings {
  enabled: boolean;
  displayOrder?: number;
}

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
