import { type Vehicle } from "./vehicles";

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  serviceType: string;
  cost: number;
  date: string;
  status: "ACTIVE" | "COMPLETED";
  createdAt: string;
}

export interface CreateMaintenanceInput {
  vehicleId: string;
  serviceType: string;
  cost: number;
  date?: string;
}

export interface UpdateMaintenanceInput {
  serviceType?: string;
  cost?: number;
  date?: string;
}

export async function getMaintenanceLogs(search?: string): Promise<MaintenanceLog[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`/api/maintenance${query}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }
  return response.json();
}

export async function createMaintenanceLog(data: CreateMaintenanceInput): Promise<MaintenanceLog> {
  const response = await fetch("/api/maintenance", {
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

export async function updateMaintenanceLog(id: string, data: UpdateMaintenanceInput): Promise<MaintenanceLog> {
  const response = await fetch(`/api/maintenance/${id}`, {
    method: "PUT",
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

export async function completeMaintenanceLog(id: string): Promise<MaintenanceLog> {
  const response = await fetch(`/api/maintenance/${id}/complete`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
}
