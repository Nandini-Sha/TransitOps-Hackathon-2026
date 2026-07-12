import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";

export async function listExpenses() {
  return prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } });
}

export async function getExpense(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new NotFoundError("Expense not found");
  return expense;
}

export async function createExpense(data: {
  vehicleId: string;
  tripId?: string;
  category: "TOLL" | "MISC";
  amount: number;
  date?: Date;
}) {
  return prisma.expense.create({ data });
}

export async function updateExpense(id: string, data: Partial<Awaited<ReturnType<typeof getExpense>>>) {
  await getExpense(id);
  return prisma.expense.update({ where: { id }, data });
}

export async function deleteExpense(id: string) {
  await getExpense(id);
  await prisma.expense.delete({ where: { id } });
}
