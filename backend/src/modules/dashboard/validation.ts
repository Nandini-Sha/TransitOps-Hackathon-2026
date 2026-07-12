import { z } from "zod";
import { VehicleStatus } from "../../../generated/prisma";

export const dashboardQuerySchema = z.object({
  type: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  region: z.string().optional(),
  search: z.string().optional(),
});
