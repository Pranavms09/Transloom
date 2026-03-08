import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  History,
  Bot,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/analysis", icon: Activity, label: "Analysis" },
    { href: "/upload", isCenter: true },
    { href: "/history", icon: History, label: "History" },
    { href: "/ai", icon: Bot, label: "AI Chat" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full min-h-[64px] pb-safe bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-5 items-center h-16 w-full">
        {navItems.map((item) => {
          if (item.isCenter) {
            // Elevated Center Button
            return (
              <div key="center-btn" className="relative flex items-center justify-center h-full">
                <Link
                  to={item.href}
                  className="absolute flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full shadow-xl shadow-blue-500/40 text-white transform transition-transform active:scale-95 border-4 border-slate-50 dark:border-slate-950 -translate-y-4"
                >
                  <UploadCloud className="w-6 h-6" />
                </Link>
              </div>
            );
          }

          const isActive =
            (location.pathname.startsWith(item.href) &&
              item.href !== "/dashboard") ||
            location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full gap-1 transition-all duration-300 w-full",
                isActive
                  ? "text-blue-600 dark:text-blue-400 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {item.icon && (
                <item.icon
                  className={cn("w-5 h-5 transition-transform duration-300", isActive && "fill-blue-600/20 scale-110")}
                />
              )}
              <span className={cn("text-xs font-semibold transition-all duration-300", isActive && "font-bold tracking-wide")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
