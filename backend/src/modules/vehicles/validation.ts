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

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  status: z.nativeEnum(VehicleStatus).optional(),
});

export const vehicleSortFields = ["regNumber", "name", "odometer", "acquisitionCost", "createdAt"] as const;

export const listVehiclesQuerySchema = z.object({
  status: z.nativeEnum(VehicleStatus).optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  search: z.string().min(1).optional(),
  sortBy: z.enum(vehicleSortFields).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
