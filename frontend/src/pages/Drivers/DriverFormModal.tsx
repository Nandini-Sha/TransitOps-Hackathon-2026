import { useEffect, useState } from "react";
import {
  createDriver,
  updateDriver,
  SAFETY_SCORE_MIN,
  SAFETY_SCORE_MAX,
  INDIAN_MOBILE_DIGITS,
  INDIAN_MOBILE_PATTERN,
  INDIAN_MOBILE_COUNTRY_CODE,
  type CreateDriverInput,
  type Driver,
} from "../../lib/drivers";
import Modal, { ModalFooter } from "../../components/ui/Modal";
import { TextField, SelectField, Field, FormError } from "../../components/ui/FormField";

interface Props {
  isOpen: boolean;
  driver: Driver | null;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm: CreateDriverInput = {
  name: "",
  licenseNumber: "",
  licenseCategory: "LMV",
  licenseExpiry: "",
  contact: "",
  safetyScore: 100,
};

function toFormData(driver: Driver): CreateDriverInput {
  return {
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    licenseCategory: driver.licenseCategory,
    licenseExpiry: driver.licenseExpiry.slice(0, 10),
    contact: driver.contact,
    safetyScore: driver.safetyScore,
  };
}

export default function DriverFormModal({ isOpen, driver, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<CreateDriverInput>(driver ? toFormData(driver) : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(driver ? toFormData(driver) : emptyForm);
    setError(null);
  }, [driver, isOpen]);

  const isEditing = driver !== null;

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData, safetyScore: Number(formData.safetyScore) };
      if (isEditing && driver) {
        await updateDriver(driver.id, payload);
      } else {
        await createDriver(payload);
      }
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? "update" : "add"} driver`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} title={isEditing ? "Edit Driver" : "Add New Driver"} onClose={handleClose}>
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Name"
          required
          placeholder="e.g. Alex Johnson"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="License No."
            required
            placeholder="e.g. LIC-001"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          />
          <SelectField
            label="Category"
            value={formData.licenseCategory}
            onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
          >
            <option value="LMV">LMV</option>
            <option value="HMV">HMV</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="License Expiry"
            required
            type="date"
            value={formData.licenseExpiry}
            onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
          />
          <Field label="Contact">
            <div className="flex items-center rounded-md border border-slate-300 dark:border-slate-700">
              <span className="pl-3 pr-2 text-sm text-slate-500 dark:text-slate-400">
                {INDIAN_MOBILE_COUNTRY_CODE}
              </span>
              <input
                required
                type="tel"
                inputMode="numeric"
                placeholder="9800000000"
                pattern={INDIAN_MOBILE_PATTERN}
                title={`Enter a valid ${INDIAN_MOBILE_DIGITS}-digit Indian mobile number`}
                maxLength={INDIAN_MOBILE_DIGITS}
                value={formData.contact}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: e.target.value.replace(/\D/g, "").slice(0, INDIAN_MOBILE_DIGITS),
                  })
                }
                className="w-full rounded-r-md bg-transparent py-2 pr-3 text-sm outline-none"
              />
            </div>
          </Field>
        </div>

        <TextField
          label={`Safety Score (${SAFETY_SCORE_MIN}-${SAFETY_SCORE_MAX})`}
          required
          type="number"
          min={SAFETY_SCORE_MIN}
          max={SAFETY_SCORE_MAX}
          value={formData.safetyScore}
          onChange={(e) => setFormData({ ...formData, safetyScore: Number(e.target.value) })}
        />

        <ModalFooter
          onCancel={handleClose}
          submitLabel={loading ? "Saving..." : isEditing ? "Save Changes" : "Add Driver"}
          loading={loading}
        />
      </form>
    </Modal>
  );
}
