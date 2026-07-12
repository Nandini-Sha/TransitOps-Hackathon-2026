import { FormEvent, useState } from "react";
import { signup } from "../../lib/auth";
import type { AuthUser } from "../../lib/auth";
import { Role } from "../../lib/enums";
import RoleSelector from "./RoleSelector";

interface SignupFormProps {
  onAuthenticated: (user: AuthUser) => void;
}

export default function SignupForm({ onAuthenticated }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.FLEET_MANAGER);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await signup(email.trim(), password, name.trim(), role);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
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
          Create an account
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your details to register
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Name
          </span>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <RoleSelector value={role} onChange={setRole} />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </form>
  );
}
