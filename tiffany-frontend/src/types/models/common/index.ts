/**
 * Common/Shared Types
 * Types used across multiple domains
 */

export * from './business-profile';

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: Address;
  mapLink?: string; // Google Maps link
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
  price?: number;
  currency?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  photo?: string;
  email?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPhoto?: string;
  rating: number; // 1-5
  comment: string;
  title?: string; // Review title/headline

  // Rich details
  visitDate?: string; // When they visited/used service
  serviceUsed?: string; // Which service/product they reviewed
  wouldRecommend?: boolean;

  // Review metadata
  isVerified?: boolean; // Verified purchase/visit
  isApproved: boolean; // Admin approval
  createdAt: string;

  // Optional response from business
  businessResponse?: {
    message: string;
    respondedAt: string;
    respondedBy?: string; // Staff name
  };

  // Helpful votes
  helpfulCount?: number;

  // Additional photos from customer
  photos?: string[];
}

export interface CustomStat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  fontFamily?: string;
  layout?: "modern" | "classic" | "minimal" | "bold";
}

export interface BusinessHours {
  day: DayOfWeek;
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "18:00"
  is24Hours?: boolean;
}

export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum BusinessType {
  RESTAURANT = "RESTAURANT",
  CAFE = "CAFE",
  RETAIL = "RETAIL",
  ECOMMERCE = "ECOMMERCE",
  SERVICE = "SERVICE",
  POS = "POS",
  OTHER = "OTHER",
}

// Section Visibility Settings
export interface ProfileSectionSettings {
  showHero: boolean;
  showAbout: boolean;
  showServices: boolean;
  showProducts: boolean;
  showGallery: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showStats: boolean;
  showContact: boolean;
  showBusinessHours: boolean;
}
