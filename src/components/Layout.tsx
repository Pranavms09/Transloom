import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "../hooks/useAuth";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [isDark, setIsDark] = useState(true);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Apply dark mode class to body based on state
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground tracking-tight">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
            style={{
              background: "linear-gradient(to bottom right, #5555ff, #10b981)",
            }}
          ></div>
          <p className="font-medium text-gray-400">Loading TransLoom...</p>
        </div>
      </div>
    );
  }

  const roleStr = "Administrator"; // Could come from user metadata in the future

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex-1 overflow-auto bg-background flex flex-col">
        <Topbar
          title={title}
          icon={icon}
          user={user ? { ...user, role: roleStr } : null}
          onLogout={logout}
          toggleTheme={() => setIsDark(!isDark)}
          isDark={isDark}
          actions={actions}
        />
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}
