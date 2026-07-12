export default function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <article
      className={`min-h-20 border border-slate-300 border-l-4 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#151515] ${accent}`}
    >
      <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}
