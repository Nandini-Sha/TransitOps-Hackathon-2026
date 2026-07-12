import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../utils/errors";

export async function listFuelLogs() {
  return prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: "desc" } });
}

export async function getFuelLog(id: string) {
  const log = await prisma.fuelLog.findUnique({ where: { id } });
  if (!log) throw new NotFoundError("Fuel log not found");
  return log;
}

export async function createFuelLog(data: {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date?: Date;
}) {
  return prisma.fuelLog.create({ data });
}

export async function updateFuelLog(id: string, data: Partial<Awaited<ReturnType<typeof getFuelLog>>>) {
  await getFuelLog(id);
  return prisma.fuelLog.update({ where: { id }, data });
}

export async function deleteFuelLog(id: string) {
  await getFuelLog(id);
  await prisma.fuelLog.delete({ where: { id } });
}
