import { Moon, Sun, User, LogOut, Upload, Bell } from "lucide-react";
import { Link } from "react-router-dom";

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
    <header className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-16 min-h-[4rem] flex items-center justify-between px-8 transition-colors duration-300">
      <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
        {icon && (
          <span className="text-blue-600 dark:text-blue-500">{icon}</span>
        )}
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {actions}

        {/* Quick Upload Button */}
        <Link
          to="/upload"
          className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative text-slate-500 dark:text-slate-400">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-slate-800 pl-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
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
