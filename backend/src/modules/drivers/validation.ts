import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.coerce.date(),
  contact: z.string().min(1),
  safetyScore: z.number().min(0).max(100).default(100),
});

export const updateDriverSchema = createDriverSchema.partial();

export const updateDriverStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "OFF_DUTY", "SUSPENDED"]),
});
