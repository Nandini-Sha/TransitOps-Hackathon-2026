export interface Trip {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue: number | null;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  finalOdometer: number | null;
  fuelConsumed: number | null;
  fuelCost: number | null;
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  vehicle?: { regNumber: string; name: string };
  driver?: { name: string };
}

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
}

export interface CompleteTripInput {
  finalOdometer: number;
  fuelConsumed: number;
  fuelCost?: number;
}

export async function getTrips(search?: string): Promise<Trip[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`/api/trips${query}`, {
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}

export async function createTrip(data: CreateTripInput): Promise<Trip> {
  const response = await fetch("/api/trips", {
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

export async function dispatchTrip(id: string): Promise<Trip> {
  const response = await fetch(`/api/trips/${id}/dispatch`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}

export async function completeTrip(id: string, data: CompleteTripInput): Promise<Trip> {
  const response = await fetch(`/api/trips/${id}/complete`, {
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

export async function cancelTrip(id: string): Promise<Trip> {
  const response = await fetch(`/api/trips/${id}/cancel`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}
