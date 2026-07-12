import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-700";
const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-400";

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function TextField({ label, className, ...props }: TextFieldProps) {
  return (
    <Field label={label}>
      <input {...props} className={`${inputClass} ${className ?? ""}`} />
    </Field>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export function SelectField({ label, className, children, ...props }: SelectFieldProps) {
  return (
    <Field label={label}>
      <select {...props} className={`${inputClass} dark:bg-[#111111] ${className ?? ""}`}>
        {children}
      </select>
    </Field>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
      {message}
    </div>
  );
}
