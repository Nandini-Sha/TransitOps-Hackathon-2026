import { useState, useEffect } from "react";
import { createVehicle, type CreateVehicleInput } from "../../lib/vehicles";
import Modal, { ModalFooter } from "../../components/ui/Modal";
import { TextField, SelectField, FormError } from "../../components/ui/FormField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm: CreateVehicleInput = {
  regNumber: "",
  name: "",
  type: "VAN",
  maxLoadCapacity: 0,
  odometer: 0,
  acquisitionCost: 0,
  region: "North",
};

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateVehicleInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setError(null);
    }
  }, [isOpen]);

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
    <Modal isOpen={isOpen} title="Add New Vehicle" onClose={onClose}>
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Registration No."
            required
            placeholder="e.g. VAN-05"
            value={formData.regNumber}
            onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
          />
          <TextField
            label="Name/Model"
            required
            placeholder="e.g. Ford Transit"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="VAN">Van</option>
            <option value="MINIVAN">Minivan</option>
            <option value="TRUCK">Truck</option>
          </SelectField>
          <SelectField
            label="Region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          >
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Capacity (kg)"
            required
            type="number"
            min="0"
            step="0.1"
            value={formData.maxLoadCapacity}
            onChange={(e) => setFormData({ ...formData, maxLoadCapacity: Number(e.target.value) })}
          />
          <TextField
            label="Odometer"
            required
            type="number"
            min="0"
            value={formData.odometer}
            onChange={(e) => setFormData({ ...formData, odometer: Number(e.target.value) })}
          />
          <TextField
            label="Acq. Cost"
            required
            type="number"
            min="0"
            value={formData.acquisitionCost}
            onChange={(e) => setFormData({ ...formData, acquisitionCost: Number(e.target.value) })}
          />
        </div>

        <ModalFooter onCancel={onClose} submitLabel={loading ? "Adding..." : "Add Vehicle"} loading={loading} />
      </form>
    </Modal>
  );
}
