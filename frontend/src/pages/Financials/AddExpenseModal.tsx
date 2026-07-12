import { useState, useEffect } from "react";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { getTrips, type Trip } from "../../lib/trips";
import { createExpense } from "../../lib/expenses";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  
  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [category, setCategory] = useState<"TOLL" | "MISC">("TOLL");
  const [amount, setAmount] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      getVehicles().then(setVehicles).catch(console.error);
      getTrips().then(setTrips).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId || !amount) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createExpense({
        vehicleId,
        tripId: tripId || undefined,
        category,
        amount: Number(amount),
      });
      setVehicleId("");
      setTripId("");
      setCategory("TOLL");
      setAmount("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-white">Add Expense</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
        </div>

        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vehicle *</span>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
            >
              <option value="">Select a vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.regNumber} ({v.name})</option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trip (Optional)</span>
            <select
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
            >
              <option value="">None</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.tripCode} ({t.source} to {t.destination})</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category *</span>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as "TOLL" | "MISC")}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
              >
                <option value="TOLL">Toll</option>
                <option value="MISC">Misc</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Amount *</span>
              <input
                required
                type="number"
                min={0}
                step={0.1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:text-white"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
