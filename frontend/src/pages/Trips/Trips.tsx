import { useEffect, useState } from "react";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { VehicleStatus } from "../../lib/enums";
import { getAvailableDrivers, type Driver } from "../../lib/drivers";
import {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  type Trip,
  type TripSortField,
} from "../../lib/trips";

const statusColor: Record<string, string> = {
  DRAFT: "bg-slate-400 text-slate-950",
  DISPATCHED: "bg-blue-500 text-white",
  COMPLETED: "bg-green-500 text-slate-950",
  CANCELLED: "bg-red-500 text-white",
};

export default function Trips({ searchQuery = "" }: { searchQuery?: string }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Pick<Driver, "id" | "name" | "licenseCategory">[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Sort State
  const [statusFilter, setStatusFilter] = useState<Trip["status"] | "All">("All");
  const [sortBy, setSortBy] = useState<TripSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form State
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState<number | "">("");
  const [plannedDistance, setPlannedDistance] = useState<number | "">("");
  const [revenue, setRevenue] = useState<number | "">("");

  // Validation State
  const [capacityError, setCapacityError] = useState<string | null>(null);
  
  // Complete Trip Modal State
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [finalOdometer, setFinalOdometer] = useState<number | "">("");
  const [fuelConsumed, setFuelConsumed] = useState<number | "">("");

  function fetchData() {
    setLoading(true);
    Promise.all([
      getTrips({
        search: searchQuery,
        status: statusFilter === "All" ? undefined : statusFilter,
        sortBy,
        sortOrder,
      }),
      getVehicles({ status: VehicleStatus.AVAILABLE }),
      getAvailableDrivers(),
    ])
      .then(([tripsData, vehiclesData, driversData]) => {
        setTrips(tripsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  function handleSort(field: TripSortField) {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  }

  useEffect(() => {
    if (vehicleId && cargoWeight !== "") {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle && Number(cargoWeight) > vehicle.maxLoadCapacity) {
        const excess = Number(cargoWeight) - vehicle.maxLoadCapacity;
        setCapacityError(`Vehicle Capacity: ${vehicle.maxLoadCapacity} kg\nCargo Weight: ${cargoWeight} kg\n✕ Capacity exceeded by ${excess} kg - dispatch blocked`);
      } else {
        setCapacityError(null);
      }
    } else {
      setCapacityError(null);
    }
  }, [vehicleId, cargoWeight, vehicles]);

  async function handleCreate(isDraft: boolean) {
    if (!source || !destination || !vehicleId || !driverId || cargoWeight === "" || plannedDistance === "") {
      alert("Please fill all fields.");
      return;
    }
    if (capacityError) {
      alert("Cannot dispatch: Capacity exceeded.");
      return;
    }

    setLoading(true);
    try {
      const trip = await createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        revenue: revenue === "" ? undefined : Number(revenue),
      });

      if (!isDraft) {
        await dispatchTrip(trip.id);
      }

      // Reset form
      setSource("");
      setDestination("");
      setVehicleId("");
      setDriverId("");
      setCargoWeight("");
      setPlannedDistance("");
      setRevenue("");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create trip");
      setLoading(false);
    }
  }

  async function handleAction(trip: Trip, action: "DISPATCH" | "CANCEL") {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this trip?`)) return;
    setLoading(true);
    try {
      if (action === "DISPATCH") await dispatchTrip(trip.id);
      if (action === "CANCEL") await cancelTrip(trip.id);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to ${action.toLowerCase()} trip`);
      setLoading(false);
    }
  }

  async function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!completingTrip || finalOdometer === "" || fuelConsumed === "") return;
    setLoading(true);
    try {
      await completeTrip(completingTrip.id, {
        finalOdometer: Number(finalOdometer),
        fuelConsumed: Number(fuelConsumed),
      });
      setCompletingTrip(null);
      setFinalOdometer("");
      setFuelConsumed("");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete trip");
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Visual */}
      <div className="flex items-center gap-6 rounded-md border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-[#111111]">
        <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
          Trip Lifecycle
        </h2>
        <div className="flex flex-1 items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-slate-400" />
            <span className="text-[10px] font-medium text-slate-400">Draft</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span className="text-[10px] font-medium text-blue-500">Dispatched</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-green-500" />
            <span className="text-[10px] font-medium text-slate-400">Completed</span>
          </div>
          <div className="h-0.5 w-16 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <span className="text-[10px] font-medium text-slate-400">Cancelled</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Pane: Create Form */}
        <section className="rounded-md border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-[#111111]">
          <h2 className="mb-4 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Create Trip
          </h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Source
              </span>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Gandhinagar Depot"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Destination
              </span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Ahmedabad Hub"
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Vehicle (Available Only)
              </span>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="" disabled>Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} - {v.maxLoadCapacity} kg capacity
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Driver (Available Only)
              </span>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="" disabled>Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseCategory})
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cargo Weight (kg)
              </span>
              <input
                type="number"
                min="0"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value ? Number(e.target.value) : "")}
                className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:bg-[#111111] ${
                  capacityError ? "border-red-500 focus:border-red-500" : "border-slate-300 dark:border-slate-700"
                }`}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Planned Distance (km)
              </span>
              <input
                type="number"
                min="0"
                value={plannedDistance}
                onChange={(e) => setPlannedDistance(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Revenue (optional)
              </span>
              <input
                type="number"
                min="0"
                placeholder="e.g. 15000"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </label>

            {capacityError && (
              <div className="rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
                {capacityError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCreate(false)}
                disabled={loading || !!capacityError || !source || !destination || !vehicleId || !driverId || cargoWeight === "" || plannedDistance === ""}
                className="flex-1 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                Dispatch
              </button>
              <button
                type="button"
                onClick={() => handleCreate(true)}
                disabled={loading || !source || !destination || !vehicleId || !driverId || cargoWeight === "" || plannedDistance === ""}
                className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Save Draft
              </button>
            </div>
          </form>
        </section>

        {/* Right Pane: Live Board */}
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Live Board
            </h2>
            <p className="text-[10px] text-slate-500">
              On Complete: odometer → fuel log → expenses → Vehicle & Driver Available
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Trip["status"] | "All")}
              className="h-9 rounded-md border border-slate-300 bg-transparent px-3 text-xs outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
            >
              <option value="All">Status: All</option>
              <option value="DRAFT">Draft</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as TripSortField)}
              className="h-9 rounded-md border border-slate-300 bg-transparent px-3 text-xs outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
            >
              <option value="createdAt">Sort: Created</option>
              <option value="tripCode">Sort: Trip Code</option>
              <option value="plannedDistance">Sort: Distance</option>
              <option value="dispatchedAt">Sort: Dispatched</option>
              <option value="completedAt">Sort: Completed</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
              className="h-9 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>

          {loading && trips.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              Loading trips...
            </div>
          ) : trips.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-md">
              No trips found.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-slate-300 border-l-4 border-l-amber-500 bg-white p-4 dark:border-slate-700 dark:border-l-amber-500 dark:bg-[#151515]">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{trip.tripCode}</span>
                      <span className={`inline-flex min-w-20 items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor[trip.status]}`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {trip.source} → {trip.destination}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {trip.vehicle?.regNumber} / {trip.driver?.name} • {trip.plannedDistance} km • {trip.cargoWeight} kg
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {trip.status === "DRAFT" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(trip, "DISPATCH")}
                          className="rounded border border-blue-500 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
                        >
                          Dispatch Now
                        </button>
                        <button
                          onClick={() => handleAction(trip, "CANCEL")}
                          className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {trip.status === "DISPATCHED" && (
                      <button
                        onClick={() => setCompletingTrip(trip)}
                        className="rounded border border-green-500 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600 hover:bg-green-500/20 dark:text-green-400"
                      >
                        Complete Trip
                      </button>
                    )}
                    {trip.status === "COMPLETED" && (
                      <span className="text-xs font-medium text-slate-500">
                        Final Odo: {trip.finalOdometer} • Fuel: {trip.fuelConsumed}L
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Complete Trip Modal */}
      {completingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111]">
            <h2 className="mb-4 text-lg font-semibold dark:text-white">Complete {completingTrip.tripCode}</h2>
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
                  onClick={() => setCompletingTrip(null)}
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
    </div>
  );
}
