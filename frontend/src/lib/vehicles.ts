export interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string;
  status: "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  type?: string;
  status?: string;
  region?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateVehicleInput {
  regNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  region: string;
}

export async function getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== "All") params.append("type", filters.type);
  if (filters?.status && filters.status !== "All") params.append("status", filters.status);
  if (filters?.region && filters.region !== "All") params.append("region", filters.region);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/vehicles${query}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  return response.json();
}

export async function createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}
