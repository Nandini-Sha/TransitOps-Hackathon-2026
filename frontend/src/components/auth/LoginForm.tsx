import { FormEvent, useMemo, useState } from "react";
import { login } from "../../lib/auth";
import RoleSelector, { roles, type UserRole } from "./RoleSelector";
import type { AuthUser } from "../../lib/auth";

interface LoginFormProps {
  onAuthenticated: (user: AuthUser) => void;
}

export default function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("FLEET_MANAGER");
  const selectedRoleInfo = useMemo(
    () => roles.find((role) => role.value === selectedRole)!,
    [selectedRole]
  );
  const [email, setEmail] = useState(selectedRoleInfo.demoEmail);
  const [password, setPassword] = useState("password123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRoleChange(role: UserRole) {
    const nextRole = roles.find((item) => item.value === role)!;
    setSelectedRole(role);
    setEmail(nextRole.demoEmail);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email.trim(), password);
      if (user.role !== selectedRole) {
        setError("Authenticated, but this account does not match the selected role.");
        return;
      }
      if (!remember) {
        window.sessionStorage.setItem("transitops-session-only", "true");
      }
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      {error ? (
        <div className="mb-5 rounded-md border border-red-400/50 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-semibold">Error state</p>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to continue
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <RoleSelector value={selectedRole} onChange={handleRoleChange} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            Remember me
          </label>
          <button type="button" className="font-medium text-amber-700 dark:text-amber-400">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p>Access is scoped by role after login.</p>
        <p>{selectedRoleInfo.label}: {selectedRoleInfo.access}</p>
        <p>Demo password: password123</p>
      </div>
    </form>
  );
}
