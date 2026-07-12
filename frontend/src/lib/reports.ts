export interface FuelEfficiencyReport {
  vehicleId: string;
  regNumber: string;
  totalDistanceKm: number;
  totalFuelLiters: number;
  kmPerLiter: number | null;
}

export interface FleetUtilizationReport {
  vehicleId: string;
  regNumber: string;
  tripHours: number;
  utilizationPct: number;
}

export interface OperationalCostReport {
  vehicleId: string;
  regNumber: string;
  fuelCost: number;
  maintenanceCost: number;
  totalOperationalCost: number;
}

export interface VehicleRoiReport {
  vehicleId: string;
  regNumber: string;
  revenue: number;
  operationalCost: number;
  acquisitionCost: number;
  roiPct: number | null;
  revenueAvailable: boolean;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getFuelEfficiencyReport(): Promise<FuelEfficiencyReport[]> {
  const response = await fetch("/api/reports/fuel-efficiency", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getFleetUtilizationReport(): Promise<FleetUtilizationReport[]> {
  const response = await fetch("/api/reports/fleet-utilization", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getOperationalCostReport(): Promise<OperationalCostReport[]> {
  const response = await fetch("/api/reports/operational-cost", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function getVehicleRoiReport(): Promise<VehicleRoiReport[]> {
  const response = await fetch("/api/reports/vehicle-roi", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
