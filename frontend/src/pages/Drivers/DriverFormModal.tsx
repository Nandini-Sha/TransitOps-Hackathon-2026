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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111] dark:text-slate-200">
        <h2 className="mb-4 text-lg font-semibold">{isEditing ? "Edit Driver" : "Add New Driver"}</h2>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">License No.</label>
              <input
                required
                type="text"
                placeholder="e.g. LIC-001"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
              <select
                value={formData.licenseCategory}
                onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-[#111111]"
              >
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">License Expiry</label>
              <input
                required
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contact</label>
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
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Safety Score ({SAFETY_SCORE_MIN}-{SAFETY_SCORE_MAX})
            </label>
            <input
              required
              type="number"
              min={SAFETY_SCORE_MIN}
              max={SAFETY_SCORE_MAX}
              value={formData.safetyScore}
              onChange={(e) => setFormData({ ...formData, safetyScore: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
