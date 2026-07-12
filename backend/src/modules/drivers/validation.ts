import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.coerce.date(),
  contact: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  safetyScore: z.number().min(0).max(100).default(100),
});

export const updateDriverSchema = createDriverSchema.partial();

export const updateDriverStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "OFF_DUTY", "SUSPENDED"]),
});

export const driverSortFields = ["name", "licenseExpiry", "safetyScore", "createdAt"] as const;

export const listDriversQuerySchema = z.object({
  search: z.string().min(1).optional(),
  sortBy: z.enum(driverSortFields).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
