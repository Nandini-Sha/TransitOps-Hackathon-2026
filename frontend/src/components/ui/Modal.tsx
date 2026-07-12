import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  headerAction?: ReactNode;
  maxWidth?: "sm" | "md";
}

export default function Modal({ isOpen, title, onClose, children, headerAction, maxWidth = "md" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidth === "sm" ? "max-w-sm" : "max-w-md"} rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#111111] dark:text-slate-200`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  disabled?: boolean;
}

export function ModalFooter({ onCancel, submitLabel, loading, disabled }: ModalFooterProps) {
  return (
    <div className="mt-6 flex justify-end gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading || disabled}
        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </div>
  );
}
