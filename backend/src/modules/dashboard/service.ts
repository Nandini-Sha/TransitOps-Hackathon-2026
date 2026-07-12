import { prisma } from "../../lib/prisma";
import { Prisma } from "../../../generated/prisma";

interface Filters {
  type?: string;
  status?: string;
  region?: string;
}

export async function getSummary(filters: Filters) {
  const vehicleWhere: Prisma.VehicleWhereInput = {
    ...(filters.type && { type: filters.type }),
    ...(filters.status && { status: filters.status as Prisma.EnumVehicleStatusFilter["equals"] }),
    ...(filters.region && { region: filters.region }),
  };

  const [activeVehicles, availableVehicles, vehiclesInMaintenance, onTripVehicles, retiredVehicles] = await Promise.all([
    prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: "RETIRED" } } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "IN_SHOP" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { ...vehicleWhere, status: "RETIRED" } }),
  ]);

  const [activeTrips, pendingTrips] = await Promise.all([
    prisma.trip.count({ where: { status: "DISPATCHED", vehicle: vehicleWhere } }),
    prisma.trip.count({ where: { status: "DRAFT", vehicle: vehicleWhere } }),
  ]);

  const driversOnDuty = await prisma.driverProfile.count({ where: { status: "ON_TRIP" } });

  const fleetUtilizationPct = activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 1000) / 10 : 0;

  const rawRecentTrips = await prisma.trip.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { vehicle: true, driver: true }
  });

  const recentTrips = rawRecentTrips.map(t => {
    let uiStatus = t.status.charAt(0) + t.status.slice(1).toLowerCase();
    let eta = "--";
    if (t.status === "DISPATCHED") {
      uiStatus = "On Trip";
      eta = "45 min";
    } else if (t.status === "DRAFT") {
      eta = "Awaiting vehicle";
    }
    return {
      id: t.tripCode,
      vehicle: t.vehicle ? t.vehicle.regNumber : "--",
      driver: t.driver ? t.driver.name : "--",
      status: uiStatus,
      eta
    };
  });

  const totalVehiclesForStatus = availableVehicles + onTripVehicles + vehiclesInMaintenance + retiredVehicles;
  
  const vehicleStatus = [
    { label: "Available", value: totalVehiclesForStatus > 0 ? Math.round((availableVehicles / totalVehiclesForStatus) * 100) : 0, color: "bg-green-500" },
    { label: "On Trip", value: totalVehiclesForStatus > 0 ? Math.round((onTripVehicles / totalVehiclesForStatus) * 100) : 0, color: "bg-blue-500" },
    { label: "In Shop", value: totalVehiclesForStatus > 0 ? Math.round((vehiclesInMaintenance / totalVehiclesForStatus) * 100) : 0, color: "bg-amber-600" },
    { label: "Retired", value: totalVehiclesForStatus > 0 ? Math.round((retiredVehicles / totalVehiclesForStatus) * 100) : 0, color: "bg-red-400" },
  ];

  return {
    kpis: [
      { label: "Active Vehicles", value: activeVehicles.toString().padStart(2, '0'), accent: "border-sky-500" },
      { label: "Available Vehicles", value: availableVehicles.toString().padStart(2, '0'), accent: "border-green-500" },
      { label: "Vehicles in Maintenance", value: vehiclesInMaintenance.toString().padStart(2, '0'), accent: "border-amber-600" },
      { label: "Active Trips", value: activeTrips.toString().padStart(2, '0'), accent: "border-blue-500" },
      { label: "Pending Trips", value: pendingTrips.toString().padStart(2, '0'), accent: "border-slate-400" },
      { label: "Drivers on Duty", value: driversOnDuty.toString().padStart(2, '0'), accent: "border-emerald-500" },
      { label: "Fleet Utilization", value: `${fleetUtilizationPct}%`, accent: "border-violet-500" },
    ],
    recentTrips,
    vehicleStatus,
  };
}
