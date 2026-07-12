import { prisma } from "../../lib/prisma";
import { VehicleStatus } from "../../../generated/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";

interface ListFilters {
  status?: VehicleStatus;
  type?: string;
  region?: string;
}

export async function listVehicles(filters: ListFilters) {
  return prisma.vehicle.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
  });
}

export async function listAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { regNumber: "asc" },
  });
}

export async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  return vehicle;
}

export async function createVehicle(data: {
  regNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string;
}) {
  return prisma.vehicle.create({ data });
}

export async function updateVehicle(id: string, data: Partial<Awaited<ReturnType<typeof getVehicle>>>) {
  await getVehicle(id);
  return prisma.vehicle.update({ where: { id }, data });
}

export async function retireVehicle(id: string) {
  const vehicle = await getVehicle(id);
  if (vehicle.status === "ON_TRIP") {
    throw new ConflictError("Cannot retire a vehicle that is currently on a trip");
  }
  return prisma.vehicle.update({ where: { id }, data: { status: "RETIRED" } });
}
