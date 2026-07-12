import { prisma } from "../../lib/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";

export async function listMaintenance(search?: string) {
  const where = search
    ? {
        OR: [
          { serviceType: { contains: search, mode: "insensitive" as const } },
          { vehicle: { regNumber: { contains: search, mode: "insensitive" as const } } },
          { vehicle: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  return prisma.maintenanceLog.findMany({
    where,
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });
}

export async function getMaintenance(id: string) {
  const record = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!record) throw new NotFoundError("Maintenance record not found");
  return record;
}

export async function createMaintenance(data: {
  vehicleId: string;
  serviceType: string;
  cost: number;
  date?: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundError("Vehicle not found");
    if (vehicle.status === "ON_TRIP") {
      throw new ConflictError("Cannot schedule maintenance for a vehicle currently on a trip");
    }
    if (vehicle.status === "RETIRED") {
      throw new ConflictError("Cannot schedule maintenance for a retired vehicle");
    }

    const record = await tx.maintenanceLog.create({ data: { ...data, status: "ACTIVE" } });
    await tx.vehicle.update({ where: { id: data.vehicleId }, data: { status: "IN_SHOP" } });
    return record;
  });
}

export async function updateMaintenance(
  id: string,
  data: { serviceType?: string; cost?: number; date?: Date }
) {
  const record = await getMaintenance(id);
  if (record.status !== "ACTIVE") {
    throw new ConflictError("Only ACTIVE maintenance records can be edited");
  }
  return prisma.maintenanceLog.update({ where: { id }, data });
}

export async function completeMaintenance(id: string) {
  return prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!record) throw new NotFoundError("Maintenance record not found");
    if (record.status !== "ACTIVE") {
      throw new ConflictError(`Cannot complete maintenance in status ${record.status}`);
    }

    const updated = await tx.maintenanceLog.update({ where: { id }, data: { status: "COMPLETED" } });

    if (record.vehicle.status !== "RETIRED") {
      await tx.vehicle.update({ where: { id: record.vehicleId }, data: { status: "AVAILABLE" } });
    }

    return updated;
  });
}
