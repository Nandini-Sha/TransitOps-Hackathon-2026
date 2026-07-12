export interface DashboardSummary {
  kpis: Array<{ label: string; value: string; accent: string }>;
  recentTrips: Array<{
    id: string;
    realId: string;
    rawStatus: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
    vehicle: string;
    driver: string;
    status: string;
    eta: string;
  }>;
  vehicleStatus: Array<{ label: string; value: number; color: string }>;
}

export interface DashboardFilters {
  type?: string;
  status?: string;
  region?: string;
  search?: string;
}

export async function getDashboardSummary(filters?: DashboardFilters): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== "All") params.append("type", filters.type);
  if (filters?.status && filters.status !== "All") params.append("status", filters.status);
  if (filters?.region && filters.region !== "All") params.append("region", filters.region);
  if (filters?.search) params.append("search", filters.search);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/dashboard/summary${query}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }
  return response.json();
}
