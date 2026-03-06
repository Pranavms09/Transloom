import { Moon, Sun, User, LogOut } from "lucide-react";

interface TopbarProps {
  title: string;
  icon?: React.ReactNode;
  user: { name: string; role: string; email?: string } | null;
  onLogout: () => void;
  toggleTheme: () => void;
  isDark: boolean;
  actions?: React.ReactNode;
}

export function Topbar({
  title,
  icon,
  user,
  onLogout,
  toggleTheme,
  isDark,
  actions,
}: TopbarProps) {
  return (
    <header className="border-b border-border bg-card h-16 min-h-[4rem] flex items-center justify-between px-8">
      <h1 className="text-xl font-bold flex items-center gap-2">
        {icon && <span className="text-blue-500">{icon}</span>}
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {actions}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="text-gray-400 w-5 h-5" />
          ) : (
            <Moon className="text-gray-400 w-5 h-5" />
          )}
        </button>

        {/* User Profile Dropdown Simulation */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-medium">
              {user ? user.name || user.email : "Loading User..."}
            </span>
            <span className="text-xs text-gray-500">
              {user ? user.role : "Administrator"}
            </span>
          </div>
          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold bg-cover bg-center">
            <User className="w-5 h-5" />
          </div>
          <button
            onClick={onLogout}
            className="ml-2 p-2 text-gray-400 hover:text-red-400 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
