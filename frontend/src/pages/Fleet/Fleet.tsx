import { useEffect, useState } from "react";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { VehicleStatus } from "../../lib/enums";
import AddVehicleModal from "./AddVehicleModal";
import EditVehicleModal from "./EditVehicleModal";

const statusColor: Record<string, string> = {
  [VehicleStatus.AVAILABLE]: "bg-green-500 text-slate-950",
  [VehicleStatus.ON_TRIP]: "bg-blue-500 text-white",
  [VehicleStatus.IN_SHOP]: "bg-orange-500 text-white",
  [VehicleStatus.RETIRED]: "bg-red-500 text-white",
};

export default function Fleet({ searchQuery }: { searchQuery: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vehicleType, setVehicleType] = useState("All");
  const [status, setStatus] = useState("All");

  const [sortBy, setSortBy] = useState("regNumber");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  function fetchVehicles() {
    setLoading(true);
    getVehicles({ type: vehicleType, status, search: searchQuery, sortBy, sortOrder })
      .then(setVehicles)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load vehicles"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchVehicles();
  }, [vehicleType, status, searchQuery, sortBy, sortOrder]);

  function handleSort(field: string) {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">

          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] sm:max-w-[150px]"
          >
            <option value="All">Type: All</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="MINIVAN">Minivan</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-[#111111] sm:max-w-[150px]"
          >
            <option value="All">Status: All</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          + Add Vehicle
        </button>
      </header>

      {error ? (
        <div className="flex h-64 items-center justify-center text-sm text-red-500">
          {error}
        </div>
      ) : loading && vehicles.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Loading vehicles...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th 
                  className="py-3 font-semibold text-[10px] cursor-pointer hover:text-amber-600 transition-colors" 
                  onClick={() => handleSort("regNumber")}
                >
                  REG. NO. (UNIQUE) {sortBy === "regNumber" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-3 font-semibold text-[10px] cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  NAME/MODEL {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 font-semibold text-[10px]">TYPE</th>
                <th className="py-3 font-semibold text-[10px]">CAPACITY</th>
                <th 
                  className="py-3 font-semibold text-[10px] cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("odometer")}
                >
                  ODOMETER {sortBy === "odometer" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="py-3 font-semibold text-[10px] cursor-pointer hover:text-amber-600 transition-colors"
                  onClick={() => handleSort("acquisitionCost")}
                >
                  ACQ. COST {sortBy === "acquisitionCost" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 font-semibold text-[10px]">STATUS</th>
                <th className="py-3 font-semibold text-[10px] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-[#151515]">
                  <td className="py-4 font-medium">{vehicle.regNumber}</td>
                  <td className="py-4 text-slate-500 dark:text-slate-400">{vehicle.name}</td>
                  <td className="py-4">{vehicle.type}</td>
                  <td className="py-4">{vehicle.maxLoadCapacity} kg</td>
                  <td className="py-4">{vehicle.odometer.toLocaleString()}</td>
                  <td className="py-4">{vehicle.acquisitionCost.toLocaleString()}</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex min-w-28 items-center justify-center rounded px-2.5 py-1 text-center text-xs font-semibold shadow-sm ${
                        statusColor[vehicle.status] || "bg-slate-400 text-white"
                      }`}
                    >
                      {vehicle.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingVehicle(vehicle)}
                      className="text-amber-600 hover:underline dark:text-amber-500 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-4 text-xs font-semibold text-amber-700 dark:text-amber-500">
            Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher
          </p>
        </div>
      )}

      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchVehicles}
      />

      <EditVehicleModal
        isOpen={editingVehicle !== null}
        vehicle={editingVehicle}
        onClose={() => setEditingVehicle(null)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
}
