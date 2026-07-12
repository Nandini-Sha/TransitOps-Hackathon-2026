export default function StatusBadge({
  status,
  colorMap,
  fallbackColor = "bg-slate-400 text-white",
}: {
  status: string;
  colorMap: Record<string, string>;
  fallbackColor?: string;
}) {
  return (
    <span
      className={`inline-flex min-w-24 items-center justify-center rounded px-2.5 py-1 text-xs font-semibold shadow-sm ${
        colorMap[status] ?? fallbackColor
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
