import { prisma } from "../../lib/prisma";
import { TripStatus } from "../../../generated/prisma";
import { ConflictError, NotFoundError } from "../../utils/errors";

function generateTripCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `TRIP-${stamp}-${seq}`;
}

export async function listTrips(filters: { status?: TripStatus }) {
  return prisma.trip.findMany({
    where: filters,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) throw new NotFoundError("Trip not found");
  return trip;
}

export async function createTrip(data: {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue?: number;
}) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new NotFoundError("Vehicle not found");
  if (vehicle.status !== "AVAILABLE") {
    throw new ConflictError(`Vehicle is not available (status: ${vehicle.status})`);
  }
  if (data.cargoWeight > vehicle.maxLoadCapacity) {
    throw new ConflictError("Cargo weight exceeds vehicle max load capacity");
  }

  const driver = await prisma.driverProfile.findUnique({ where: { id: data.driverId } });
  if (!driver) throw new NotFoundError("Driver not found");
  if (driver.status !== "AVAILABLE") {
    throw new ConflictError(`Driver is not available (status: ${driver.status})`);
  }
  if (driver.licenseExpiry <= new Date()) {
    throw new ConflictError("Driver's license has expired");
  }

  return prisma.trip.create({
    data: { ...data, tripCode: generateTripCode(), status: "DRAFT" },
  });
}

interface UpdateTripInput {
  source?: string;
  destination?: string;
  vehicleId?: string;
  driverId?: string;
  cargoWeight?: number;
  plannedDistance?: number;
  revenue?: number;
}

export async function updateTrip(id: string, data: UpdateTripInput) {
  const trip = await getTrip(id);
  if (trip.status !== "DRAFT") {
    throw new ConflictError("Only DRAFT trips can be edited");
  }
  return prisma.trip.update({ where: { id }, data });
}

export async function dispatchTrip(id: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
    if (!trip) throw new NotFoundError("Trip not found");
    if (trip.status !== "DRAFT") {
      throw new ConflictError(`Cannot dispatch trip in status ${trip.status}`);
    }
    if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) {
      throw new ConflictError("Cargo exceeds vehicle capacity");
    }
    if (trip.driver.status === "SUSPENDED" || trip.driver.licenseExpiry <= new Date()) {
      throw new ConflictError("Driver ineligible (suspended or license expired)");
    }

    const vehicleUpdate = await tx.vehicle.updateMany({
      where: { id: trip.vehicleId, status: "AVAILABLE" },
      data: { status: "ON_TRIP" },
    });
    if (vehicleUpdate.count === 0) throw new ConflictError("Vehicle is no longer available");

    const driverUpdate = await tx.driverProfile.updateMany({
      where: { id: trip.driverId, status: "AVAILABLE" },
      data: { status: "ON_TRIP" },
    });
    if (driverUpdate.count === 0) throw new ConflictError("Driver is no longer available");

    return tx.trip.update({
      where: { id },
      data: { status: "DISPATCHED", dispatchedAt: new Date() },
    });
  });
}

export async function completeTrip(
  id: string,
  input: { finalOdometer: number; fuelConsumed: number; fuelCost?: number }
) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundError("Trip not found");
    if (trip.status !== "DISPATCHED") {
      throw new ConflictError(`Cannot complete trip in status ${trip.status}`);
    }

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE", odometer: input.finalOdometer },
    });
    await tx.driverProfile.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    });

    if (input.fuelCost !== undefined) {
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          tripId: trip.id,
          liters: input.fuelConsumed,
          cost: input.fuelCost,
        },
      });
    }

    return tx.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        finalOdometer: input.finalOdometer,
        fuelConsumed: input.fuelConsumed,
      },
    });
  });
}

export async function cancelTrip(id: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id } });
    if (!trip) throw new NotFoundError("Trip not found");
    if (trip.status !== "DRAFT" && trip.status !== "DISPATCHED") {
      throw new ConflictError(`Cannot cancel trip in status ${trip.status}`);
    }

    if (trip.status === "DISPATCHED") {
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
      await tx.driverProfile.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
    }

    return tx.trip.update({ where: { id }, data: { status: "CANCELLED" } });
  });
}
