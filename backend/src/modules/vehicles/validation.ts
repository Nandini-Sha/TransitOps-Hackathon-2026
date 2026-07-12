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

export const updateVehicleSchema = createVehicleSchema.partial();

export const listVehiclesQuerySchema = z.object({
  status: z.nativeEnum(VehicleStatus).optional(),
  type: z.string().optional(),
  region: z.string().optional(),
});
