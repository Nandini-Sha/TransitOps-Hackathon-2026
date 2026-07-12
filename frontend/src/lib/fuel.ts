export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicle?: { regNumber: string };
  tripId?: string;
  trip?: { tripCode: string };
  date: string;
  liters: number;
  cost: number;
}

export interface CreateFuelLogInput {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date?: string;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getFuelLogs(): Promise<FuelLog[]> {
  const response = await fetch("/api/fuel", { credentials: "include" });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function createFuelLog(data: CreateFuelLogInput): Promise<FuelLog> {
  const response = await fetch("/api/fuel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
