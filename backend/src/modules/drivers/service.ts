import { prisma } from "../../lib/prisma";
import { NotFoundError, ConflictError } from "../../utils/errors";

export async function listDrivers() {
  return prisma.driverProfile.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listAvailableDrivers() {
  return prisma.driverProfile.findMany({
    where: { status: "AVAILABLE", licenseExpiry: { gt: new Date() } },
    select: { id: true, name: true, licenseCategory: true },
    orderBy: { name: "asc" },
  });
}

export async function getDriver(id: string) {
  const driver = await prisma.driverProfile.findUnique({ where: { id } });
  if (!driver) throw new NotFoundError("Driver not found");
  return driver;
}

export async function createDriver(data: {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: Date;
  contact: string;
  safetyScore: number;
}) {
  return prisma.driverProfile.create({ data });
}

export async function updateDriver(id: string, data: Partial<Awaited<ReturnType<typeof getDriver>>>) {
  await getDriver(id);
  return prisma.driverProfile.update({ where: { id }, data });
}

export async function updateDriverStatus(id: string, status: "AVAILABLE" | "OFF_DUTY" | "SUSPENDED") {
  const driver = await getDriver(id);
  if (driver.status === "ON_TRIP") {
    throw new ConflictError("Cannot manually change status of a driver currently on a trip");
  }
  return prisma.driverProfile.update({ where: { id }, data: { status } });
}
