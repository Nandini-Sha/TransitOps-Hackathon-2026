import { useEffect, useMemo, useState } from "react";
import LoginPage from "./pages/Auth/Login";
import { getCurrentUser, logout, type AuthUser } from "./lib/auth";

const roleHome: Record<AuthUser["role"], Array<string>> = {
  FLEET_MANAGER: ["Fleet overview", "Vehicle registry", "Maintenance"],
  DRIVER: ["Trip creation", "Dispatch board", "Available drivers"],
  SAFETY_OFFICER: ["Driver safety", "Compliance review", "Trip monitoring"],
  FINANCIAL_ANALYST: ["Fuel logs", "Expenses", "Financial reports"],
};

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return window.localStorage.getItem("transitops-theme") !== "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("transitops-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const permittedAreas = useMemo(() => (user ? roleHome[user.role] : []), [user]);

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-700 dark:bg-[#111111] dark:text-slate-200">
        Checking secure session...
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onAuthenticated={setUser}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((current) => !current)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-[#111111] dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              TransitOps
            </p>
            <h1 className="text-xl font-semibold">Authenticated workspace</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
            >
              {darkMode ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
          <h2 className="mt-1 text-3xl font-semibold">{user.name}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {user.email} · {user.role.split("_").join(" ")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {permittedAreas.map((area) => (
            <article
              key={area}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="text-sm font-semibold">{area}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Available for this role through backend RBAC.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
