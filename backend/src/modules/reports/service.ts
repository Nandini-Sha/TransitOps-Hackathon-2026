import { prisma } from "../../lib/prisma";

async function loadVehiclesWithRelations() {
  return prisma.vehicle.findMany({
    include: {
      fuelLogs: true,
      maintenanceLogs: true,
      trips: { where: { status: "COMPLETED" } },
    },
    orderBy: { regNumber: "asc" },
  });
}

export async function getFuelEfficiencyReport() {
  const vehicles = await loadVehiclesWithRelations();
  return vehicles.map((v) => {
    const totalDistance = v.trips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const totalFuel = v.trips.reduce((sum, t) => sum + (t.fuelConsumed ?? 0), 0);
    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      totalDistanceKm: totalDistance,
      totalFuelLiters: totalFuel,
      kmPerLiter: totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 100) / 100 : null,
    };
  });
}

const UTILIZATION_WINDOW_DAYS = 30;

export async function getFleetUtilizationReport() {
  const vehicles = await loadVehiclesWithRelations();
  const windowStart = Date.now() - UTILIZATION_WINDOW_DAYS * 24 * 3_600_000;
  const windowHours = UTILIZATION_WINDOW_DAYS * 24;

  return vehicles.map((v) => {
    const tripHours = v.trips.reduce((sum, t) => {
      if (!t.dispatchedAt || !t.completedAt) return sum;
      if (t.completedAt.getTime() < windowStart) return sum;
      return sum + (t.completedAt.getTime() - t.dispatchedAt.getTime()) / 3_600_000;
    }, 0);
    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      tripHours: Math.round(tripHours * 100) / 100,
      utilizationPct: Math.min(100, Math.round((tripHours / windowHours) * 1000) / 10),
    };
  });
}

export async function getOperationalCostReport() {
  const vehicles = await loadVehiclesWithRelations();
  return vehicles.map((v) => {
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      fuelCost,
      maintenanceCost,
      totalOperationalCost: fuelCost + maintenanceCost,
    };
  });
}

export async function getVehicleRoiReport() {
  const vehicles = await loadVehiclesWithRelations();
  return vehicles.map((v) => {
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const operationalCost = fuelCost + maintenanceCost;
    const revenueEntries = v.trips.filter((t) => t.revenue !== null);
    const revenue = revenueEntries.reduce((sum, t) => sum + (t.revenue ?? 0), 0);
    const revenueAvailable = revenueEntries.length > 0;
    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      revenue,
      operationalCost,
      acquisitionCost: v.acquisitionCost,
      roiPct:
        revenueAvailable && v.acquisitionCost > 0
          ? Math.round(((revenue - operationalCost) / v.acquisitionCost) * 1000) / 10
          : null,
      revenueAvailable,
    };
  });
}
