import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma";

interface Filters {
  type?: string;
  status?: string;
  region?: string;
}

export async function getKpis(filters: Filters) {
  const vehicleWhere: Prisma.VehicleWhereInput = {
    ...(filters.type && { type: filters.type }),
    ...(filters.status && { status: filters.status as Prisma.EnumVehicleStatusFilter["equals"] }),
    ...(filters.region && { region: filters.region }),
  };

  const [activeVehicles, availableVehicles, vehiclesInMaintenance, onTripVehicles] = await Promise.all([
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: "RETIRED" } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "IN_SHOP" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "ON_TRIP" } }),
  ]);

  const [activeTrips, pendingTrips] = await Promise.all([
    prisma.trip.count({ where: { status: "DISPATCHED", vehicle: vehicleWhere } }),
    prisma.trip.count({ where: { status: "DRAFT", vehicle: vehicleWhere } }),
  ]);

  const driversOnDuty = await prisma.driverProfile.count({ where: { status: "ON_TRIP" } });

  const fleetUtilization = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 1000) / 10 : 0;

  return {
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilizationPct: fleetUtilization,
  };
}
