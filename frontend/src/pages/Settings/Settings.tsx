import { useState, useEffect } from "react";
import type { AuthUser } from "../../lib/auth";

export default function Settings({ user }: { user: AuthUser }) {
  const [depotName, setDepotName] = useState("Gandhinagar Depot 6J4");
  const [currency, setCurrency] = useState("INR (Rs)");
  const [distanceUnit, setDistanceUnit] = useState("Kilometers");

  useEffect(() => {
    const saved = localStorage.getItem("transitOps_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.depotName) setDepotName(parsed.depotName);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.distanceUnit) setDistanceUnit(parsed.distanceUnit);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("transitOps_settings", JSON.stringify({
      depotName,
      currency,
      distanceUnit
    }));
    alert("Settings saved successfully!");
  }

  const isFleetManager = user.role === "FLEET_MANAGER";

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-2">
        {/* GENERAL SETTINGS */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            General
          </h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-sm">
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                Depot Name
              </span>
              <input
                type="text"
                disabled={!isFleetManager}
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white disabled:opacity-60"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                Currency
              </span>
              <input
                type="text"
                disabled={!isFleetManager}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white disabled:opacity-60"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                Distance Unit
              </span>
              <input
                type="text"
                disabled={!isFleetManager}
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white disabled:opacity-60"
              />
            </label>
            {isFleetManager && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  Save changes
                </button>
              </div>
            )}
            {!isFleetManager && (
              <p className="text-xs text-slate-500 italic mt-2">Only Fleet Managers can edit general settings.</p>
            )}
          </form>
        </div>

        {/* ROLE-BASED ACCESS */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Role-Based Access (RBAC)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3 font-semibold text-[10px]">ROLE</th>
                  <th className="py-3 font-semibold text-[10px]">FLEET</th>
                  <th className="py-3 font-semibold text-[10px]">DRIVER</th>
                  <th className="py-3 font-semibold text-[10px]">TRIPS</th>
                  <th className="py-3 font-semibold text-[10px]">FUEL/EXP.</th>
                  <th className="py-3 font-semibold text-[10px]">ANALYTICS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">Fleet Manager</td>
                  <td className="py-4">✓</td>
                  <td className="py-4">✓</td>
                  <td className="py-4">-</td>
                  <td className="py-4">-</td>
                  <td className="py-4">✓</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">Dispatcher (Driver)</td>
                  <td className="py-4">View</td>
                  <td className="py-4">-</td>
                  <td className="py-4">✓</td>
                  <td className="py-4">-</td>
                  <td className="py-4">-</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">Safety Officer</td>
                  <td className="py-4">-</td>
                  <td className="py-4">✓</td>
                  <td className="py-4">View</td>
                  <td className="py-4">-</td>
                  <td className="py-4">-</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">Financial Analyst</td>
                  <td className="py-4">View</td>
                  <td className="py-4">-</td>
                  <td className="py-4">-</td>
                  <td className="py-4">✓</td>
                  <td className="py-4">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
