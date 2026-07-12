import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1),
  serviceType: z.string().min(1),
  cost: z.number().nonnegative(),
  date: z.coerce.date().optional(),
});

export const updateMaintenanceSchema = z.object({
  serviceType: z.string().min(1).optional(),
  cost: z.number().nonnegative().optional(),
  date: z.coerce.date().optional(),
});
