import { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onValueChange: (value: string) => void;
}

export default function SearchInput({ onValueChange, className, ...props }: SearchInputProps) {
  return (
    <input
      type="search"
      onChange={(e) => onValueChange(e.target.value)}
      className={`h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 ${className ?? ""}`}
      {...props}
    />
  );
}
