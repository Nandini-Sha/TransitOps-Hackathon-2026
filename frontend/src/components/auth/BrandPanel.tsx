import { roles } from "./RoleSelector";

export default function BrandPanel() {
  return (
    <aside className="flex min-h-[620px] flex-col justify-between bg-slate-100 p-8 text-slate-950 dark:bg-slate-200 lg:p-10">
      <div>
        <div className="mb-4 h-9 w-9 rounded-sm border border-amber-700/60 bg-[repeating-linear-gradient(45deg,#d39b39_0,#d39b39_1px,transparent_1px,transparent_4px)]" />
        <h1 className="text-2xl font-semibold tracking-tight">TransitOps</h1>
        <p className="mt-1 text-sm text-slate-600">Smart Transport Operations Platform</p>

        <div className="mt-24">
          <p className="mb-3 text-sm font-semibold">One login, four roles:</p>
          <ul className="space-y-2 text-sm text-slate-700">
            {roles.map((role) => (
              <li key={role.value} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-700" />
                <span>{role.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-slate-500">TransitOps © 2026 · RBAC enabled</p>
    </aside>
  );
}
