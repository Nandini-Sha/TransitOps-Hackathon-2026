import BrandPanel from "../../components/auth/BrandPanel";
import LoginForm from "../../components/auth/LoginForm";
import type { AuthUser } from "../../lib/auth";

interface LoginPageProps {
  onAuthenticated: (user: AuthUser) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function LoginPage({
  onAuthenticated,
  darkMode,
  onToggleTheme,
}: LoginPageProps) {
  return (
    <main className="min-h-screen bg-white p-4 text-slate-950 transition-colors dark:bg-[#111111] dark:text-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden border border-slate-300 dark:border-slate-700 lg:grid-cols-[0.72fr_1fr]">
        <BrandPanel />
        <section className="relative flex items-center justify-center px-6 py-12 sm:px-10">
          <button
            type="button"
            onClick={onToggleTheme}
            className="absolute right-5 top-5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <LoginForm onAuthenticated={onAuthenticated} />
        </section>
      </div>
    </main>
  );
}
