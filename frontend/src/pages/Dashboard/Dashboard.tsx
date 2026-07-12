import { useEffect, useState } from "react";
import type { AuthUser } from "../../lib/auth";
import { getDashboardSummary, type DashboardSummary } from "../../lib/dashboard";
import { dispatchTrip, completeTrip, cancelTrip } from "../../lib/trips";
import Fleet from "../Fleet/Fleet";
import Drivers from "../Drivers/Drivers";
import Compliance from "../Drivers/Compliance";
import Maintenance from "../Maintenance/Maintenance";
import Trips from "../Trips/Trips";

interface DashboardProps {
  user: AuthUser;
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const allNavItems = [
  { name: "Dashboard", roles: ["DRIVER"] }, // Driver = Dispatcher in business logic
  { name: "Fleet", roles: ["FLEET_MANAGER"] },
  { name: "Drivers", roles: ["SAFETY_OFFICER"] },
  { name: "Trips", roles: ["DRIVER"] },
  { name: "Maintenance", roles: ["FLEET_MANAGER"] },
  { name: "Compliance", roles: ["SAFETY_OFFICER"] },
  { name: "Fuel & Expenses", roles: ["FINANCIAL_ANALYST"] },
  { name: "Analytics", roles: ["FINANCIAL_ANALYST"] },
];

const statusColor: Record<string, string> = {
  "On Trip": "bg-blue-500 text-white",
  Completed: "bg-green-500 text-slate-950",
  Dispatched: "bg-sky-400 text-slate-950",
  Draft: "bg-slate-400 text-slate-950",
  Cancelled: "bg-red-500 text-white",
};

export default function Dashboard({
  user,
  darkMode,
  onToggleTheme,
  onLogout,
}: DashboardProps) {
  const allowedNavItems = allNavItems.filter((item) => item.roles.includes(user.role));
  const [activeTab, setActiveTab] = useState(allowedNavItems[0]?.name || "Dashboard");

  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");
  const [region, setRegion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Complete Trip Modal State
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [finalOdometer, setFinalOdometer] = useState<number | "">("");
  const [fuelConsumed, setFuelConsumed] = useState<number | "">("");

  function fetchDashboard() {
    setLoading(true);
    getDashboardSummary({ type: vehicleType, status, region, search: searchQuery })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (activeTab === "Dashboard") {
      fetchDashboard();
    }
  }, [activeTab, vehicleType, status, region, searchQuery]);

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!completingTripId || finalOdometer === "" || fuelConsumed === "") return;
    setLoading(true);
    try {
      await completeTrip(completingTripId, {
        finalOdometer: Number(finalOdometer),
        fuelConsumed: Number(fuelConsumed),
      });
      setCompletingTripId(null);
      setFinalOdometer("");
      setFuelConsumed("");
      fetchDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete trip");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 transition-colors dark:bg-[#111111] dark:text-slate-100">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden border border-slate-300 bg-white dark:border-slate-600 dark:bg-[#111111] lg:grid-cols-[170px_1fr]">
        <aside className="flex flex-col border-b border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-[#171717] lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 px-4 py-4 dark:border-slate-700 lg:block">
              <p className="text-sm font-semibold">TransitOps</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:block lg:space-y-2 lg:overflow-visible">
              {allowedNavItems.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTab(item.name)}
                  className={`shrink-0 rounded-md px-3 py-2 text-left text-xs font-medium transition lg:w-full ${
                    item.name === activeTab
                      ? "border border-amber-600 bg-amber-600/10 text-amber-700 dark:text-amber-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 mt-auto border-t border-slate-300 dark:border-slate-700 lg:border-t-0">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="flex flex-col gap-3 border-b border-slate-300 px-4 py-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              placeholder={activeTab === "Dashboard" ? "Search trips or drivers..." : activeTab === "Fleet" ? "Search reg. no..." : activeTab === "Maintenance" ? "Search maintenance logs..." : activeTab === "Trips" ? "Search trips..." : "Search..."}
              title={activeTab === "Fleet" ? "Search by registration number, name/model, or type" : activeTab === "Dashboard" ? "Search by trip code, driver name, or vehicle registration number" : undefined}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] md:max-w-xs"
            />
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-slate-600 dark:text-slate-300">{user.name}</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="rounded-md border border-slate-300 px-3 py-2 font-semibold dark:border-slate-700"
              >
                {darkMode ? "Light" : "Dark"}
              </button>
            </div>
          </header>

          <div className="space-y-6 p-4">
            {activeTab === "Fleet" ? (
              <Fleet searchQuery={searchQuery} />
            ) : activeTab === "Drivers" ? (
              <Drivers />
            ) : activeTab === "Compliance" ? (
              <Compliance />
            ) : activeTab === "Maintenance" ? (
              <Maintenance searchQuery={searchQuery} />
            ) : activeTab === "Trips" ? (
              <Trips searchQuery={searchQuery} />
            ) : activeTab !== "Dashboard" ? (
              <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <p className="text-lg font-semibold">{activeTab}</p>
                <p className="text-sm">This module is under construction.</p>
              </div>
            ) : loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                Loading dashboard...
              </div>
            ) : error ? (
              <div className="flex h-64 items-center justify-center text-sm text-red-500">
                {error}
              </div>
            ) : !data ? null : (
            <>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Filters
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] dark:text-slate-300"
                >
                  <option value="All">Vehicle Type: All</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="MINIVAN">Minivan</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] dark:text-slate-300"
                >
                  <option value="All">Status: All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </select>

                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] dark:text-slate-300"
                >
                  <option value="All">Region: All</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
            </div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {data.kpis.map((kpi) => (
                <article
                  key={kpi.label}
                  className={`min-h-20 border border-slate-300 border-l-4 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515] ${kpi.accent}`}
                >
                  <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="min-w-0">
                <h2 className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Recent Trips
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="py-2 font-medium">Trip</th>
                        <th className="py-2 font-medium">Vehicle</th>
                        <th className="py-2 font-medium">Driver</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 text-right font-medium">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {data.recentTrips.map((trip) => (
                        <tr key={trip.id}>
                          <td className="py-3 font-semibold">{trip.id}</td>
                          <td className="py-3">{trip.vehicle}</td>
                          <td className="py-3">{trip.driver}</td>
                          <td className="py-3">
                            <select
                              value={trip.rawStatus}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (newStatus === trip.rawStatus) return;
                                
                                if (newStatus === "COMPLETED") {
                                  setCompletingTripId(trip.realId);
                                  return;
                                }
                                
                                try {
                                  if (newStatus === "DISPATCHED") {
                                    if (!confirm("Dispatch this trip?")) return;
                                    await dispatchTrip(trip.realId);
                                  } else if (newStatus === "CANCELLED") {
                                    if (!confirm("Cancel this trip?")) return;
                                    await cancelTrip(trip.realId);
                                  }
                                  fetchDashboard();
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Failed to update trip");
                                }
                              }}
                              className={`inline-flex min-w-28 cursor-pointer appearance-none outline-none items-center justify-center rounded px-2.5 py-1 text-center text-xs font-semibold shadow-sm ${
                                statusColor[trip.status] || "bg-slate-400 text-slate-900"
                              }`}
                            >
                              <option value="DRAFT" disabled className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">Draft</option>
                              <option value="DISPATCHED" disabled={trip.rawStatus === "COMPLETED" || trip.rawStatus === "CANCELLED"} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">Dispatched</option>
                              <option value="COMPLETED" disabled={trip.rawStatus !== "DISPATCHED"} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">Completed</option>
                              <option value="CANCELLED" disabled={trip.rawStatus === "COMPLETED" || trip.rawStatus === "CANCELLED"} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-200">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 text-right">{trip.eta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Vehicle Status
                </h2>
                <div className="space-y-4">
                  {data.vehicleStatus.map((item) => (
                    <div key={item.label} className="grid grid-cols-[80px_1fr] items-center gap-3 text-xs">
                      <span>{item.label}</span>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            </>
            )}
          </div>
        </section>
      </div>

      {/* Complete Trip Modal */}
      {completingTripId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111]">
            <h2 className="mb-4 text-lg font-semibold dark:text-white">Complete Trip</h2>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Final Odometer</span>
                <input
                  required
                  type="number"
                  min={0}
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fuel Consumed (Liters)</span>
                <input
                  required
                  type="number"
                  min={0}
                  step={0.1}
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
                />
              </label>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingTripId(null)}
                  disabled={loading}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || finalOdometer === "" || fuelConsumed === ""}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
