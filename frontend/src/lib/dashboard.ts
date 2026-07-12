export interface DashboardSummary {
  kpis: Array<{ label: string; value: string; accent: string }>;
  recentTrips: Array<{
    id: string;
    vehicle: string;
    driver: string;
    status: string;
    eta: string;
  }>;
  vehicleStatus: Array<{ label: string; value: number; color: string }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/summary", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }
  return response.json();
}
