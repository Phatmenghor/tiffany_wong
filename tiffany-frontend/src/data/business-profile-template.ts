/**
 * Demo System Admin Settings Template
 * Used for development and as example data
 */

import {
  SystemAdminSettings,
  BusinessType,
  DayOfWeek,
} from "@/types/system-admin";

export const demoBusinessProfile: SystemAdminSettings = {
  id: "demo-1",
  slug: "tiffany-cambodia",
  businessName: "Tiffany Cambodia",
  tagline: "Experience Excellence",
  description: "Welcome to Tiffany Cambodia - Your premier destination for quality products and services.",
  logo: "/assets/image/logo.png",
  coverImage: "/assets/image/cover.jpg",
  businessType: BusinessType.POS,
  industry: "Retail & Service",
  contact: {
    email: "info@tiffanycambodia.com",
    phone: "+855 123 456 789",
    whatsapp: "+855 123 456 789",
    address: {
      street: "123 Main Street",
      city: "Phnom Penh",
      state: "Phnom Penh",
      country: "Cambodia",
      postalCode: "12000",
    },
    mapLink: "https://maps.google.com",
  },
  socialMedia: {
    facebook: "https://facebook.com/tiffanycambodia",
    instagram: "https://instagram.com/tiffanycambodia",
    twitter: "https://twitter.com/tiffanycambodia",
    website: "https://tiffanycambodia.com",
  },
  businessHours: [
    {
      day: DayOfWeek.MONDAY,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
    {
      day: DayOfWeek.TUESDAY,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
    {
      day: DayOfWeek.WEDNESDAY,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
    {
      day: DayOfWeek.THURSDAY,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
    {
      day: DayOfWeek.FRIDAY,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    },
    {
      day: DayOfWeek.SATURDAY,
      isOpen: true,
      openTime: "10:00",
      closeTime: "17:00",
    },
    {
      day: DayOfWeek.SUNDAY,
      isOpen: false,
      openTime: "10:00",
      closeTime: "17:00",
    },
  ],
  gallery: [],
  features: ["Quality Products", "Excellent Service", "Fast Delivery"],
  services: [],
  team: [],
  reviews: [],
  stats: {
    yearsInBusiness: 5,
    customersServed: 10000,
    projectsCompleted: 500,
    productsAvailable: 250,
  },
  theme: {
    primaryColor: "#FF6B6B",
    fontFamily: "Inter",
    layout: "modern",
  },
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
