import { z } from "zod";
import { TripStatus } from "../../../generated/prisma";

export const createTripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  revenue: z.number().nonnegative().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const completeTripSchema = z.object({
  finalOdometer: z.number().nonnegative(),
  fuelConsumed: z.number().nonnegative(),
  fuelCost: z.number().nonnegative().optional(),
});

export const listTripsQuerySchema = z.object({
  status: z.nativeEnum(TripStatus).optional(),
});
