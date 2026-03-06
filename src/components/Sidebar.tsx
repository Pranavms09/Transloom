import { Link, useLocation } from "react-router-dom";
import {
  Languages,
  X,
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  SplitSquareHorizontal,
  Database,
  BookA,
  Paintbrush,
  ShieldAlert,
  CheckSquare,
  BarChart2,
  Settings,
  CreditCard,
  HelpCircle,
} from "lucide-react";

export function Sidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  const location = useLocation();

  const getLinkClass = (path: string, exact: boolean = false) => {
    const isActive = exact
      ? location.pathname === path
      : location.pathname.startsWith(path);

    // Extract base logic from original html
    const baseClass = "flex items-center gap-3 px-3 py-2 rounded-lg transition";
    if (isActive) {
      return `${baseClass} bg-gray-800 text-white`;
    }
    return `${baseClass} text-gray-400 hover:bg-gray-800 hover:text-white`;
  };

  return (
    <aside
      className={`bg-sidebar text-foreground border-r border-border transition-all duration-300 flex flex-col h-full overflow-y-auto ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex items-center justify-between h-16 min-h-[4rem] px-4 border-b border-border sticky top-0 bg-sidebar z-10">
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(to bottom right, #5555ff, #10b981)",
            }}
          >
            <Languages className="text-white w-5 h-5" />
          </div>
          {isOpen && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">
              TransLoom
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X
            className={`w-5 h-5 transition-transform ${!isOpen && "rotate-180"}`}
          />
        </button>
      </div>

      <nav className="p-4 space-y-1 flex-1 text-sm font-medium">
        <Link to="/dashboard" className={getLinkClass("/dashboard", true)}>
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Dashboard</span>}
        </Link>
        <Link to="/projects" className={getLinkClass("/projects", true)}>
          <FolderOpen className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Projects</span>}
        </Link>
        <Link to="/projects/new" className={getLinkClass("/projects/new")}>
          <PlusCircle className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="text-gray-300">New Project</span>}
        </Link>
        <div className="my-4 border-t border-border"></div>
        <Link to="/workspace" className={getLinkClass("/workspace")}>
          <SplitSquareHorizontal className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Translation Workspace</span>}
        </Link>
        <Link to="/memory" className={getLinkClass("/memory")}>
          <Database className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Translation Memory</span>}
        </Link>
        <Link to="/glossary" className={getLinkClass("/glossary")}>
          <BookA className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Glossary</span>}
        </Link>
        <Link to="/style-profiles" className={getLinkClass("/style-profiles")}>
          <Paintbrush className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Style Profiles</span>}
        </Link>
        <div className="my-4 border-t border-border"></div>
        <Link to="/validation" className={getLinkClass("/validation")}>
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Validation Reports</span>}
        </Link>
        <Link to="/review" className={getLinkClass("/review")}>
          <CheckSquare className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Review Queue</span>}
        </Link>
        <Link to="/analytics" className={getLinkClass("/analytics")}>
          <BarChart2 className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Analytics</span>}
        </Link>
        <div className="my-4 border-t border-border"></div>
        <Link to="/settings" className={getLinkClass("/settings")}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Settings</span>}
        </Link>
        <Link to="/billing" className={getLinkClass("/billing")}>
          <CreditCard className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Billing</span>}
        </Link>
        <Link to="/help" className={`${getLinkClass("/help")} pb-6`}>
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span>Help / Documentation</span>}
        </Link>
      </nav>
    </aside>
  );
}
