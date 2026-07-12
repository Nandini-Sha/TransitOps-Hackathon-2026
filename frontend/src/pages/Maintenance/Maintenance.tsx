import { useEffect, useState } from "react";
import { getMaintenanceLogs, createMaintenanceLog, completeMaintenanceLog, type MaintenanceLog } from "../../lib/maintenance";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { VehicleStatus } from "../../lib/enums";

export default function Maintenance({ searchQuery = "" }: { searchQuery?: string }) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [vehicleId, setVehicleId] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function fetchData() {
    setLoading(true);
    Promise.all([
      getMaintenanceLogs(searchQuery),
      getVehicles({ status: VehicleStatus.AVAILABLE }), // Only Available vehicles can go to maintenance
    ])
      .then(([logsData, vehiclesData]) => {
        setLogs(logsData);
        setVehicles(vehiclesData);
        if (vehiclesData.length > 0 && !vehicleId) {
          setVehicleId(vehiclesData[0].id);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId || !serviceType || !cost || !date) {
      setFormError("All fields are required");
      return;
    }
    
    setSubmitting(true);
    setFormError(null);
    try {
      await createMaintenanceLog({
        vehicleId,
        serviceType,
        cost: Number(cost),
        date: new Date(date).toISOString(),
      });
      // Reset form
      setServiceType("");
      setCost("");
      setDate(new Date().toISOString().split("T")[0]);
      // Refresh data
      fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to schedule maintenance");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete(id: string) {
    if (!window.confirm("Mark this maintenance as completed and return the vehicle to Available status?")) return;
    try {
      await completeMaintenanceLog(id);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete maintenance");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
      {/* Left Column: Form */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111111]">
        <h2 className="mb-6 font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          LOG SERVICE RECORD
        </h2>

        {formError && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
              Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              required
            >
              <option value="" disabled>Select an available vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} ({v.name})
                </option>
              ))}
            </select>
            {vehicles.length === 0 && !loading && (
              <p className="text-xs text-red-500 mt-1">No available vehicles to schedule.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
              Service Type
            </label>
            <input
              type="text"
              placeholder="e.g. Oil Change"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
              Cost
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 2500"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
              Status
            </label>
            <input
              type="text"
              value="Active"
              readOnly
              className="w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || vehicles.length === 0}
            className="mt-6 w-full rounded-md bg-[#b45309] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-green-500">Available</span>
              <span className="text-slate-400">→</span>
              <span className="text-orange-500">In Shop</span>
            </div>
            <span className="text-slate-400 italic">creating active record</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">In Shop</span>
              <span className="text-slate-400">→</span>
              <span className="text-green-500">Available</span>
            </div>
            <span className="text-slate-400 italic">closing record (not retired)</span>
          </div>
          <p className="mt-4 text-[10px] text-amber-600 dark:text-amber-500">
            Note: In Shop vehicles are removed from the dispatch pool.
          </p>
        </div>
      </div>

      {/* Right Column: Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111111]">
        <h2 className="mb-6 font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          SERVICE LOG
        </h2>
        
        {error ? (
          <div className="flex h-64 items-center justify-center text-sm text-red-500">
            {error}
          </div>
        ) : loading && logs.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-500">
            Loading service logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3 font-semibold text-[10px]">VEHICLE</th>
                  <th className="py-3 font-semibold text-[10px]">SERVICE</th>
                  <th className="py-3 font-semibold text-[10px]">COST</th>
                  <th className="py-3 font-semibold text-[10px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                    <td className="py-4 font-medium">{log.vehicle?.regNumber || "Unknown"}</td>
                    <td className="py-4">{log.serviceType}</td>
                    <td className="py-4">{log.cost.toLocaleString()}</td>
                    <td className="py-4">
                      {log.status === "ACTIVE" ? (
                        <button
                          type="button"
                          title="Click to complete maintenance"
                          onClick={() => handleComplete(log.id)}
                          className="inline-flex min-w-24 cursor-pointer items-center justify-center rounded bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                        >
                          In Shop
                        </button>
                      ) : (
                        <span className="inline-flex min-w-24 cursor-default items-center justify-center rounded bg-green-500 px-2.5 py-1 text-xs font-semibold text-slate-950 shadow-sm">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No maintenance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
