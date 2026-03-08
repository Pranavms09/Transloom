import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./theme-provider";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Layout({
  children,
  title,
  icon = <LayoutDashboard className="w-5 h-5" />,
  actions,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Determine current active theme for Topbar icon toggle
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 tracking-tight transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
            style={{
              background: "linear-gradient(to bottom right, #5555ff, #10b981)",
            }}
          ></div>
          <p className="font-medium text-slate-500 dark:text-gray-400">
            Loading MedEDI...
          </p>
        </div>
      </div>
    );
  }

  const roleStr = "Administrator";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex-1 overflow-auto flex flex-col transition-colors duration-300">
        <Topbar
          title={title}
          icon={icon}
          user={user ? { ...user, role: roleStr } : null}
          onLogout={logout}
          toggleTheme={() => setTheme(isDark ? "light" : "dark")}
          isDark={isDark}
          actions={actions}
        />
        <div className="flex-1 overflow-auto p-4 pb-24 md:p-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
