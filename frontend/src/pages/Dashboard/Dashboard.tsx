import { useEffect, useState } from "react";
import type { AuthUser } from "../../lib/auth";
import { getDashboardSummary, type DashboardSummary } from "../../lib/dashboard";

interface DashboardProps {
  user: AuthUser;
  darkMode: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}

const navItems = [
  "Dashboard",
  "Fleet",
  "Drivers",
  "Trips",
  "Maintenance",
  "Fuel & Expenses",
  "Analytics",
  "Settings",
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
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-950 transition-colors dark:bg-[#111111] dark:text-slate-100">
      <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden border border-slate-300 bg-white dark:border-slate-600 dark:bg-[#111111] lg:grid-cols-[170px_1fr]">
        <aside className="flex flex-col border-b border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-[#171717] lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 px-4 py-4 dark:border-slate-700 lg:block">
              <p className="text-sm font-semibold">TransitOps</p>
            </div>
            <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:block lg:space-y-2 lg:overflow-visible">
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`shrink-0 rounded-md px-3 py-2 text-left text-xs font-medium transition lg:w-full ${
                    item === "Dashboard"
                      ? "border border-amber-600 bg-amber-600/10 text-amber-700 dark:text-amber-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                  }`}
                >
                  {item}
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
              placeholder="Search..."
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
            {loading ? (
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
                {["Vehicle Type: All", "Status: All", "Region: All"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className="h-9 rounded-md border border-slate-300 px-3 text-left text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    {filter}
                  </button>
                ))}
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
                            <span
                              className={`inline-flex min-w-24 justify-center rounded px-2 py-1 font-semibold ${statusColor[trip.status] || "bg-slate-400"}`}
                            >
                              {trip.status}
                            </span>
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
    </main>
  );
}
