import { z } from "zod";

export const createLocationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  latitude: z.number(),
  longitude: z.number(),
  houseNumber: z.string().optional().default(""),
  streetNumber: z.string().optional().default(""),
  village: z.string().optional().default(""),
  commune: z.string().optional().default(""),
  district: z.string().min(1, "District is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().optional().default(""),
  note: z.string().optional().default(""),
  isDefault: z.boolean().default(false),
});

export type LocationFormData = z.infer<typeof createLocationSchema>;
