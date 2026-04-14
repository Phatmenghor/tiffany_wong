import { z } from "zod";

/**
 * Business Settings Form Schema
 * Type-safe validation and types for business settings form
 */

export const businessSettingsSchema = z.object({
  systemName: z.string().min(1, "System name is required"),
  description: z.string().optional(),
  taxPercentage: z.string().optional(),
  logoSystemUrl: z.string().optional(),
  socialMedia: z.array(
    z.object({
      name: z.string(),
      linkUrl: z.string(),
      iconUrl: z.string().optional(),
    })
  ),
  primaryColor: z.string().min(1, "Primary color is required"),
  // Contact Information
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  // Business Hours
  businessHours: z.array(
    z.object({
      day: z.string(),
      openingTime: z.string(),
      closingTime: z.string(),
    })
  ).optional(),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
