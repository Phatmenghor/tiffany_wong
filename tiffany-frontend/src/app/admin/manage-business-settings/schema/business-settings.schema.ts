import { z } from "zod";

export const businessSettingsSchema = z.object({
  description: z.string().optional(),
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  telegramUrl: z.string().optional(),
});

export type BusinessSettingsFormData = z.infer<typeof businessSettingsSchema>;
