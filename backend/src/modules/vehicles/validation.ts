import { z } from "zod";
import { VehicleStatus } from "../../../generated/prisma";

export const createVehicleSchema = z.object({
  regNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().nonnegative().default(0),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().min(1),
});

// status is intentionally excluded: it may only change via trip dispatch/complete/cancel,
// maintenance create/complete, or the dedicated retire endpoint (PDF section 4 business rules).
export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleSortFields = ["regNumber", "name", "odometer", "acquisitionCost", "createdAt"] as const;

export const listVehiclesQuerySchema = z.object({
  status: z.nativeEnum(VehicleStatus).optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  search: z.string().min(1).optional(),
  sortBy: z.enum(vehicleSortFields).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
