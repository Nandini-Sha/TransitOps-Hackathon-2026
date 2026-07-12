import { z } from "zod";
import { ExpenseCategory } from "../../../generated/prisma";

export const createExpenseSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  category: z.nativeEnum(ExpenseCategory),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
