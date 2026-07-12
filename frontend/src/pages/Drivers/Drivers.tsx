import { useEffect, useState } from "react";
import {
  getDrivers,
  updateDriverStatus,
  isLicenseExpired,
  isLowSafetyScore,
  DriverStatus,
  INDIAN_MOBILE_COUNTRY_CODE,
  type Driver,
  type DriverStatusValue,
  type DriverSortField,
} from "../../lib/drivers";
import DriverFormModal from "./DriverFormModal";

const statusColor: Record<DriverStatusValue, string> = {
  [DriverStatus.AVAILABLE]: "bg-green-500 text-slate-950",
  [DriverStatus.ON_TRIP]: "bg-blue-500 text-white",
  [DriverStatus.OFF_DUTY]: "bg-slate-400 text-slate-950",
  [DriverStatus.SUSPENDED]: "bg-red-500 text-white",
};

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<DriverSortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  function fetchDrivers() {
    setLoading(true);
    getDrivers({ search: searchQuery, sortBy, sortOrder })
      .then(setDrivers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load drivers"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, sortOrder]);

  function handleSort(field: DriverSortField) {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  function openAddModal() {
    setEditingDriver(null);
    setIsModalOpen(true);
  }

  function openEditModal(driver: Driver) {
    setEditingDriver(driver);
    setIsModalOpen(true);
  }

  async function handleToggleSuspend(driver: Driver) {
    const nextStatus =
      driver.status === DriverStatus.SUSPENDED ? DriverStatus.AVAILABLE : DriverStatus.SUSPENDED;
    setActioningId(driver.id);
    try {
      await updateDriverStatus(driver.id, nextStatus);
      fetchDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update driver status");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search name, license no..."
          title="Search by name, license number, license category, or contact number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 sm:max-w-[240px]"
        />
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          + Add Driver
        </button>
      </header>

      {error ? (
        <div className="flex h-64 items-center justify-center text-sm text-red-500">{error}</div>
      ) : loading && drivers.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Loading drivers...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th
                  className="py-3 text-[10px] font-semibold cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 text-[10px] font-semibold">License No.</th>
                <th className="py-3 text-[10px] font-semibold">Category</th>
                <th
                  className="py-3 text-[10px] font-semibold cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("licenseExpiry")}
                >
                  Expiry {sortBy === "licenseExpiry" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 text-[10px] font-semibold">Contact</th>
                <th
                  className="py-3 text-[10px] font-semibold cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("safetyScore")}
                >
                  Safety Score {sortBy === "safetyScore" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 text-[10px] font-semibold">Status</th>
                <th className="py-3 text-[10px] font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {drivers.map((driver) => (
                <tr key={driver.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">{driver.name}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">{driver.licenseNumber}</td>
                  <td className="py-4">{driver.licenseCategory}</td>
                  <td className={`py-4 ${isLicenseExpired(driver) ? "font-semibold text-red-600 dark:text-red-400" : ""}`}>
                    {new Date(driver.licenseExpiry).toLocaleDateString()}
                    {isLicenseExpired(driver) ? " (expired)" : ""}
                  </td>
                  <td className="py-4">
                    {INDIAN_MOBILE_COUNTRY_CODE} {driver.contact}
                  </td>
                  <td className={`py-4 ${isLowSafetyScore(driver) ? "font-semibold text-red-600 dark:text-red-400" : ""}`}>
                    {driver.safetyScore}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex min-w-24 items-center justify-center rounded px-2.5 py-1 text-xs font-semibold shadow-sm ${statusColor[driver.status]}`}
                    >
                      {driver.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(driver)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={driver.status === DriverStatus.ON_TRIP || actioningId === driver.id}
                        onClick={() => handleToggleSuspend(driver)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                      >
                        {driver.status === DriverStatus.SUSPENDED ? "Reinstate" : "Suspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No drivers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-4 text-xs font-semibold text-amber-700 dark:text-amber-500">
            Rule: Expired-license or Suspended drivers cannot be assigned to trips.
          </p>
        </div>
      )}

      <DriverFormModal
        isOpen={isModalOpen}
        driver={editingDriver}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDrivers}
      />
    </div>
  );
}
