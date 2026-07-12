import { useEffect, useState } from "react";
import {
  getDrivers,
  updateDriverStatus,
  isLicenseExpired,
  isLicenseExpiringSoon,
  isLowSafetyScore,
  LOW_SAFETY_SCORE_THRESHOLD,
  LICENSE_EXPIRY_WARNING_DAYS,
  DriverStatus,
  type Driver,
} from "../../lib/drivers";

type ComplianceFlag = "Expired License" | "License Expiring Soon" | "Low Safety Score" | "Suspended";

function getFlags(driver: Driver): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  if (driver.status === DriverStatus.SUSPENDED) flags.push("Suspended");
  if (isLicenseExpired(driver)) flags.push("Expired License");
  else if (isLicenseExpiringSoon(driver)) flags.push("License Expiring Soon");
  if (isLowSafetyScore(driver)) flags.push("Low Safety Score");
  return flags;
}

const flagColor: Record<ComplianceFlag, string> = {
  "Expired License": "bg-red-500 text-white",
  Suspended: "bg-red-500 text-white",
  "License Expiring Soon": "bg-amber-500 text-slate-950",
  "Low Safety Score": "bg-amber-500 text-slate-950",
};

export default function Compliance() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  function fetchDrivers() {
    setLoading(true);
    getDrivers({ sortBy: "licenseExpiry", sortOrder: "asc" })
      .then(setDrivers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load drivers"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function handleSuspend(driver: Driver) {
    setActioningId(driver.id);
    try {
      await updateDriverStatus(driver.id, DriverStatus.SUSPENDED);
      fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update driver status");
    } finally {
      setActioningId(null);
    }
  }

  if (loading && drivers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Loading compliance data...
      </div>
    );
  }

  if (error) {
    return <div className="flex h-64 items-center justify-center text-sm text-red-500">{error}</div>;
  }

  const flagged = drivers
    .map((driver) => ({ driver, flags: getFlags(driver) }))
    .filter((entry) => entry.flags.length > 0);

  const expiredCount = drivers.filter(isLicenseExpired).length;
  const expiringSoonCount = drivers.filter((d) => !isLicenseExpired(d) && isLicenseExpiringSoon(d)).length;
  const lowScoreCount = drivers.filter(isLowSafetyScore).length;
  const suspendedCount = drivers.filter((d) => d.status === DriverStatus.SUSPENDED).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-red-500 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Expired Licenses
          </p>
          <p className="mt-2 text-2xl font-semibold">{expiredCount.toString().padStart(2, "0")}</p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-amber-500 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Expiring in {LICENSE_EXPIRY_WARNING_DAYS} Days
          </p>
          <p className="mt-2 text-2xl font-semibold">{expiringSoonCount.toString().padStart(2, "0")}</p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-amber-500 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Safety Score Below {LOW_SAFETY_SCORE_THRESHOLD}
          </p>
          <p className="mt-2 text-2xl font-semibold">{lowScoreCount.toString().padStart(2, "0")}</p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-red-500 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            Suspended Drivers
          </p>
          <p className="mt-2 text-2xl font-semibold">{suspendedCount.toString().padStart(2, "0")}</p>
        </article>
      </section>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Flagged Drivers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3 text-[10px] font-semibold">Name</th>
                <th className="py-3 text-[10px] font-semibold">License Expiry</th>
                <th className="py-3 text-[10px] font-semibold">Safety Score</th>
                <th className="py-3 text-[10px] font-semibold">Flags</th>
                <th className="py-3 text-[10px] font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {flagged.map(({ driver, flags }) => (
                <tr key={driver.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">{driver.name}</td>
                  <td className="py-4">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                  <td className="py-4">{driver.safetyScore}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {flags.map((flag) => (
                        <span
                          key={flag}
                          className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-semibold shadow-sm ${flagColor[flag]}`}
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      disabled={
                        driver.status === DriverStatus.SUSPENDED ||
                        driver.status === DriverStatus.ON_TRIP ||
                        actioningId === driver.id
                      }
                      onClick={() => handleSuspend(driver)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
              {flagged.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No compliance issues found. All drivers are in good standing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
