import { useState, useEffect } from "react";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { getTrips, type Trip } from "../../lib/trips";
import { createExpense } from "../../lib/expenses";
import Modal, { ModalFooter } from "../../components/ui/Modal";
import { SelectField, TextField, FormError } from "../../components/ui/FormField";

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
    <Modal isOpen={isOpen} title="Add Expense" onClose={onClose}>
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectField label="Vehicle *" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Select a vehicle...</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.regNumber} ({v.name})
            </option>
          ))}
        </SelectField>

        <SelectField label="Trip (Optional)" value={tripId} onChange={(e) => setTripId(e.target.value)}>
          <option value="">None</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tripCode} ({t.source} to {t.destination})
            </option>
          ))}
        </SelectField>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category *"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as "TOLL" | "MISC")}
          >
            <option value="TOLL">Toll</option>
            <option value="MISC">Misc</option>
          </SelectField>
          <TextField
            label="Amount *"
            required
            type="number"
            min={0}
            step={0.1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <ModalFooter onCancel={onClose} submitLabel={loading ? "Adding..." : "Add Expense"} loading={loading} />
      </form>
    </Modal>
  );
}
