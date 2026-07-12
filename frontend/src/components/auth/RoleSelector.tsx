export type UserRole =
  | "FLEET_MANAGER"
  | "DRIVER"
  | "SAFETY_OFFICER"
  | "FINANCIAL_ANALYST";

export const roles: Array<{
  value: UserRole;
  label: string;
  access: string;
  demoEmail: string;
}> = [
  {
    value: "FLEET_MANAGER",
    label: "Fleet Manager",
    access: "Fleet, maintenance, dashboard",
    demoEmail: "fleet.manager@transitops.demo",
  },
  {
    value: "DRIVER",
    label: "Dispatcher",
    access: "Trips and dispatch workflow",
    demoEmail: "driver@transitops.demo",
  },
  {
    value: "SAFETY_OFFICER",
    label: "Safety Officer",
    access: "Drivers, compliance, trip review",
    demoEmail: "safety.officer@transitops.demo",
  },
  {
    value: "FINANCIAL_ANALYST",
    label: "Financial Analyst",
    access: "Fuel, expenses, analytics",
    demoEmail: "finance@transitops.demo",
  },
];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Role
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as UserRole)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </label>
  );
}
