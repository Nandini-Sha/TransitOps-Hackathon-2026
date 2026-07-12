import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-amber-600 text-white shadow-sm hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900",
  danger: "text-red-600 hover:underline disabled:opacity-40 dark:text-red-400",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const sizing = variant === "danger" ? "text-xs font-semibold" : "rounded-md px-4 py-2 text-sm font-semibold transition";
  return <button {...props} className={`${sizing} ${variantClass[variant]} ${className ?? ""}`} />;
}
