import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  date: z.coerce.date().optional(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial();
