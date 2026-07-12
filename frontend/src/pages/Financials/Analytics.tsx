import { useEffect, useState, useMemo } from "react";
import {
  getFuelEfficiencyReport,
  getFleetUtilizationReport,
  getOperationalCostReport,
  getVehicleRoiReport,
  type FuelEfficiencyReport,
  type FleetUtilizationReport,
  type OperationalCostReport,
  type VehicleRoiReport,
} from "../../lib/reports";
import { getTrips, type Trip } from "../../lib/trips";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [fuelEff, setFuelEff] = useState<FuelEfficiencyReport[]>([]);
  const [fleetUtil, setFleetUtil] = useState<FleetUtilizationReport[]>([]);
  const [opCost, setOpCost] = useState<OperationalCostReport[]>([]);
  const [roi, setRoi] = useState<VehicleRoiReport[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFuelEfficiencyReport(),
      getFleetUtilizationReport(),
      getOperationalCostReport(),
      getVehicleRoiReport(),
      getTrips(),
    ])
      .then(([f, u, o, r, t]) => {
        setFuelEff(f);
        setFleetUtil(u);
        setOpCost(o);
        setRoi(r);
        setTrips(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Aggregated KPIs
  const avgFuelEff = useMemo(() => {
    const valid = fuelEff.filter((f) => f.kmPerLiter !== null);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.kmPerLiter!, 0);
    return (sum / valid.length).toFixed(1);
  }, [fuelEff]);

  const avgFleetUtil = useMemo(() => {
    if (fleetUtil.length === 0) return 0;
    const sum = fleetUtil.reduce((acc, curr) => acc + curr.utilizationPct, 0);
    return Math.round(sum / fleetUtil.length);
  }, [fleetUtil]);

  const totalOpCost = useMemo(() => {
    return opCost.reduce((acc, curr) => acc + curr.totalOperationalCost, 0);
  }, [opCost]);

  const avgRoi = useMemo(() => {
    const valid = roi.filter((r) => r.roiPct !== null);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.roiPct!, 0);
    return (sum / valid.length).toFixed(1);
  }, [roi]);

  // Chart Data: Monthly Revenue
  const monthlyRevenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map((month) => ({ month, revenue: 0 }));

    trips.forEach((trip) => {
      if (trip.revenue && trip.completedAt) {
        const date = new Date(trip.completedAt);
        const m = date.getMonth();
        data[m].revenue += trip.revenue;
      }
    });

    // Trim to only show up to current month if desired, but returning all 12 is fine.
    return data;
  }, [trips]);

  // Chart Data: Top Costliest Vehicles
  const topCostliestData = useMemo(() => {
    return [...opCost]
      .sort((a, b) => b.totalOperationalCost - a.totalOperationalCost)
      .slice(0, 5)
      .map((v) => ({
        name: v.regNumber,
        cost: v.totalOperationalCost,
      }));
  }, [opCost]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-blue-500 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Fuel Efficiency</p>
          <p className="mt-2 text-2xl font-semibold">{avgFuelEff} <span className="text-sm font-normal text-slate-500">km/L</span></p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-green-500 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Fleet Utilization</p>
          <p className="mt-2 text-2xl font-semibold">{avgFleetUtil}<span className="text-sm font-normal text-slate-500">%</span></p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-orange-500 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Operational Cost</p>
          <p className="mt-2 text-2xl font-semibold">{totalOpCost.toLocaleString()}</p>
        </article>
        <article className="min-h-20 border border-slate-300 border-l-4 border-l-purple-500 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#151515]">
          <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Vehicle ROI</p>
          <p className="mt-2 text-2xl font-semibold">{avgRoi}<span className="text-sm font-normal text-slate-500">%</span></p>
        </article>
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Monthly Revenue
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                  itemStyle={{ color: "#3b82f6" }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Top Costliest Vehicles
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topCostliestData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                  itemStyle={{ color: "#f43f5e" }}
                />
                <Bar dataKey="cost" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
