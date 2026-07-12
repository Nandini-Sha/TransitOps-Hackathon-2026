import { useState } from "react";
import { createVehicle, type CreateVehicleInput } from "../../lib/vehicles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateVehicleInput>({
    regNumber: "",
    name: "",
    type: "VAN",
    maxLoadCapacity: 0,
    odometer: 0,
    acquisitionCost: 0,
    region: "North",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createVehicle({
        ...formData,
        maxLoadCapacity: Number(formData.maxLoadCapacity),
        odometer: Number(formData.odometer),
        acquisitionCost: Number(formData.acquisitionCost),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111] dark:text-slate-200">
        <h2 className="mb-4 text-lg font-semibold">Add New Vehicle</h2>
        
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
                placeholder="e.g. VAN-05"
                value={formData.regNumber}
                onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name/Model</label>
              <input
                required
                type="text"
                placeholder="e.g. Ford Transit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type</label>
              <select
                value={formData.type}
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
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
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
                value={formData.maxLoadCapacity}
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
                value={formData.odometer}
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
                value={formData.acquisitionCost}
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
              {loading ? "Adding..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
