import { useState, useEffect } from "react";
import { updateVehicle, retireVehicle, deleteVehicle, type Vehicle, type CreateVehicleInput } from "../../lib/vehicles";
import { VehicleStatus } from "../../lib/enums";
import Modal, { ModalFooter } from "../../components/ui/Modal";
import { TextField, SelectField, Field, FormError } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

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
      });
      setError(null);
    }
  }, [vehicle, isOpen]);

  if (!vehicle) return null;

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
    <Modal
      isOpen={isOpen}
      title="Edit Vehicle"
      onClose={onClose}
      headerAction={
        <div className="flex gap-4">
          {vehicle.status !== VehicleStatus.RETIRED && (
            <Button variant="danger" onClick={handleRetire} disabled={loading} className="text-orange-600 dark:text-orange-400">
              Retire
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      }
    >
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Registration No."
            required
            value={formData.regNumber || ""}
            onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
          />
          <TextField
            label="Name/Model"
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <SelectField
            label="Type"
            value={formData.type || "VAN"}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="VAN">Van</option>
            <option value="MINIVAN">Minivan</option>
            <option value="TRUCK">Truck</option>
          </SelectField>
          <SelectField
            label="Region"
            value={formData.region || "North"}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          >
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </SelectField>
          <Field label="Status">
            <p className="flex h-[38px] items-center rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {vehicle.status.replace("_", " ")}
            </p>
          </Field>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Status changes automatically via trip dispatch/completion and maintenance records. Use Retire for permanent decommissioning.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Capacity (kg)"
            required
            type="number"
            min="0"
            step="0.1"
            value={formData.maxLoadCapacity || 0}
            onChange={(e) => setFormData({ ...formData, maxLoadCapacity: Number(e.target.value) })}
          />
          <TextField
            label="Odometer"
            required
            type="number"
            min="0"
            value={formData.odometer || 0}
            onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
          />
          <TextField
            label="Acq. Cost"
            required
            type="number"
            min="0"
            value={formData.acquisitionCost || 0}
            onChange={(e) => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })}
          />
        </div>

        <ModalFooter onCancel={onClose} submitLabel={loading ? "Saving..." : "Save Changes"} loading={loading} />
      </form>
    </Modal>
  );
}
