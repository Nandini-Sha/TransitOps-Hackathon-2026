import { useEffect, useState } from "react";
import LoginPage from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import { getCurrentUser, logout, type AuthUser } from "./lib/auth";

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
    <Dashboard
      user={user}
      darkMode={darkMode}
      onToggleTheme={() => setDarkMode((current) => !current)}
      onLogout={handleLogout}
    />
  );
}
