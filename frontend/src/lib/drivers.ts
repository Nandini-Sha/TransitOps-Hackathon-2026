export const DriverStatus = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  OFF_DUTY: "OFF_DUTY",
  SUSPENDED: "SUSPENDED",
} as const;

export type DriverStatusValue = (typeof DriverStatus)[keyof typeof DriverStatus];

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  safetyScore: number;
  status: DriverStatusValue;
  createdAt: string;
  updatedAt: string;
}

export interface DriverFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateDriverInput {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  safetyScore: number;
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getDrivers(filters?: DriverFilters): Promise<Driver[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/drivers${query}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function createDriver(data: CreateDriverInput): Promise<Driver> {
  const response = await fetch("/api/drivers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function updateDriver(id: string, data: Partial<CreateDriverInput>): Promise<Driver> {
  const response = await fetch(`/api/drivers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export const LOW_SAFETY_SCORE_THRESHOLD = 70;
export const LICENSE_EXPIRY_WARNING_DAYS = 30;
export const SAFETY_SCORE_MIN = 0;
export const SAFETY_SCORE_MAX = 100;
export const INDIAN_MOBILE_DIGITS = 10;
export const INDIAN_MOBILE_PATTERN = "[6-9][0-9]{9}";
export const INDIAN_MOBILE_COUNTRY_CODE = "+91";

export function isLicenseExpired(driver: Pick<Driver, "licenseExpiry">) {
  return new Date(driver.licenseExpiry).getTime() < Date.now();
}

export function isLicenseExpiringSoon(driver: Pick<Driver, "licenseExpiry">) {
  const msUntilExpiry = new Date(driver.licenseExpiry).getTime() - Date.now();
  const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);
  return daysUntilExpiry >= 0 && daysUntilExpiry <= LICENSE_EXPIRY_WARNING_DAYS;
}

export function isLowSafetyScore(driver: Pick<Driver, "safetyScore">) {
  return driver.safetyScore < LOW_SAFETY_SCORE_THRESHOLD;
}

export async function updateDriverStatus(
  id: string,
  status: typeof DriverStatus.AVAILABLE | typeof DriverStatus.OFF_DUTY | typeof DriverStatus.SUSPENDED
): Promise<Driver> {
  const response = await fetch(`/api/drivers/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
