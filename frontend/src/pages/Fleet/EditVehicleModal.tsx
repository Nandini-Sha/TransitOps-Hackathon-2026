import { useState, useEffect } from "react";
import { updateVehicle, retireVehicle, deleteVehicle, type Vehicle, type CreateVehicleInput } from "../../lib/vehicles";
import { VehicleStatus } from "../../lib/enums";

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVehicleModal({ vehicle, isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<Partial<CreateVehicleInput>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        regNumber: vehicle.regNumber,
        name: vehicle.name,
        type: vehicle.type,
        maxLoadCapacity: vehicle.maxLoadCapacity,
        odometer: vehicle.odometer,
        acquisitionCost: vehicle.acquisitionCost,
        region: vehicle.region,
        status: vehicle.status,
      });
      setError(null);
    }
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateVehicle(vehicle!.id, {
        ...formData,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  }

  async function handleRetire() {
    if (!window.confirm("Are you sure you want to retire this vehicle? This action is permanent.")) return;
    setLoading(true);
    setError(null);
    try {
      await retireVehicle(vehicle!.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retire vehicle");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to permanently DELETE this vehicle? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteVehicle(vehicle!.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete vehicle. It may be tied to existing trips.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111] dark:text-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Vehicle</h2>
          <div className="flex gap-4">
            {vehicle.status !== VehicleStatus.RETIRED && (
              <button
                type="button"
                onClick={handleRetire}
                disabled={loading}
                className="text-xs font-semibold text-orange-600 hover:underline dark:text-orange-400"
              >
                Retire
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
            >
              Delete
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Registration No.</label>
              <input
                required
                type="text"
                value={formData.regNumber || ""}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name/Model</label>
              <input
                required
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type</label>
              <select
                value={formData.type || "VAN"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="VAN">Van</option>
                <option value="MINIVAN">Minivan</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Region</label>
              <select
                value={formData.region || "North"}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
              <select
                value={formData.status || VehicleStatus.AVAILABLE}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value={VehicleStatus.AVAILABLE}>Available</option>
                <option value={VehicleStatus.ON_TRIP}>On Trip</option>
                <option value={VehicleStatus.IN_SHOP}>In Shop</option>
                <option value={VehicleStatus.RETIRED}>Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Capacity (kg)</label>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={formData.maxLoadCapacity || 0}
                onChange={(e) => setFormData({ ...formData, maxLoadCapacity: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Odometer</label>
              <input
                required
                type="number"
                min="0"
                value={formData.odometer || 0}
                onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Acq. Cost</label>
              <input
                required
                type="number"
                min="0"
                value={formData.acquisitionCost || 0}
                onChange={(e) => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
