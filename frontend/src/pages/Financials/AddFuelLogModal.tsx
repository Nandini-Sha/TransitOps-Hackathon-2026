import { useState, useEffect } from "react";
import { getVehicles, type Vehicle } from "../../lib/vehicles";
import { getTrips, type Trip } from "../../lib/trips";
import { createFuelLog } from "../../lib/fuel";
import Modal, { ModalFooter } from "../../components/ui/Modal";
import { SelectField, TextField, FormError } from "../../components/ui/FormField";

interface AddFuelLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFuelLogModal({ isOpen, onClose, onSuccess }: AddFuelLogModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [tripId, setTripId] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");

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
    if (!vehicleId || !liters || !cost) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createFuelLog({
        vehicleId,
        tripId: tripId || undefined,
        liters: Number(liters),
        cost: Number(cost),
      });
      setVehicleId("");
      setTripId("");
      setLiters("");
      setCost("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log fuel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title="Log Fuel" onClose={onClose}>
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
          <TextField
            label="Liters *"
            required
            type="number"
            min={0}
            step={0.1}
            value={liters}
            onChange={(e) => setLiters(e.target.value)}
          />
          <TextField
            label="Cost *"
            required
            type="number"
            min={0}
            step={0.1}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>

        <ModalFooter onCancel={onClose} submitLabel={loading ? "Logging..." : "Log Fuel"} loading={loading} />
      </form>
    </Modal>
  );
}
