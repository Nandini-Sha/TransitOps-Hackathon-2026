import { prisma } from "../../lib/prisma";
import { Prisma, VehicleStatus } from "../../../generated/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { vehicleSortFields } from "./validation";

interface ListFilters {
  status?: VehicleStatus;
  type?: string;
  region?: string;
  search?: string;
  sortBy: (typeof vehicleSortFields)[number];
  sortOrder: "asc" | "desc";
}

export async function listVehicles({ status, type, region, search, sortBy, sortOrder }: ListFilters) {
  const where: Prisma.VehicleWhereInput = {
    ...(status && { status }),
    ...(type && { type }),
    ...(region && { region }),
    ...(search && {
      OR: [
        { regNumber: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  return prisma.vehicle.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
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
