import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Upload,
  Layers,
  Clock,
  Network,
  ListTree,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileText,
  DollarSign,
  Users,
  Bot,
  HelpCircle,
  BarChart2,
  TrendingUp,
  Activity,
  Settings,
  BookOpen,
  LifeBuoy,
  FileJson,
  RefreshCw
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  const navGroups = [
    {
      label: "Main",
      links: [{ href: "/dashboard/batch", icon: LayoutDashboard, text: "Batch Dashboard" }],
    },
    {
      label: "File Processing",
      links: [
        { href: "/upload", icon: Upload, text: "Upload EDI File" },
        { href: "/upload/batch", icon: Layers, text: "Batch Upload" },
        { href: "/recent", icon: Clock, text: "Recent Files" },
      ],
    },
    {
      label: "File Explorer",
      links: [
        {
          href: "/explorer/parsed",
          icon: FileJson,
          text: "Parsed Structure Viewer",
        },
        { href: "/explorer/tree", icon: ListTree, text: "Segment Tree Viewer" },
      ],
    },
    {
      label: "Validation",
      links: [
        { href: "/validation", icon: ShieldCheck, text: "Validation Results" },
        {
          href: "/validation/errors",
          icon: AlertTriangle,
          text: "Error Reports",
        },
        {
          href: "/validation/suggestions",
          icon: Lightbulb,
          text: "Fix Suggestions",
        },
      ],
    },
    {
      label: "Transaction Insights",
      links: [
        { href: "/insights/837", icon: FileText, text: "837 Claims Summary" },
        {
          href: "/insights/835",
          icon: DollarSign,
          text: "835 Payment Summary",
        },
        { href: "/insights/834", icon: Users, text: "834 Member Enrollment" },
        { href: "/reconciliation", icon: RefreshCw, text: "Reconciliation" },
      ],
    },
    {
      label: "AI Assistant",
      links: [
        { href: "/ai/explain", icon: Bot, text: "AI Error Explanation" },
        { href: "/ai/ask", icon: HelpCircle, text: "Ask About File" },
      ],
    },
    {
      label: "Analytics",
      links: [
        {
          href: "/analytics/errors",
          icon: BarChart2,
          text: "Error Statistics",
        },
        {
          href: "/analytics/trends",
          icon: TrendingUp,
          text: "Validation Trends",
        },
        {
          href: "/analytics/metrics",
          icon: Activity,
          text: "Processing Metrics",
        },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/settings", icon: Settings, text: "Settings" },
        { href: "/docs", icon: BookOpen, text: "Documentation" },
        { href: "/help", icon: LifeBuoy, text: "Help" },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col h-full overflow-y-auto hidden md:flex text-slate-600 dark:text-slate-300",
        isOpen ? "w-[260px]" : "w-0 overflow-hidden border-none",
      )}
    >
      <div className="flex items-center justify-between h-16 min-h-[4rem] px-4 border-b border-gray-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
            <Network className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            ClaimLens
          </span>
        </div>
      </div>

      <nav className="p-4 space-y-6 flex-1 text-sm font-medium">
        {navGroups.map((group, i) => (
          <div key={i}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-2">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.links.map((link) => {
                const isActive =
                  (location.pathname.startsWith(link.href) &&
                    link.href !== "/dashboard") ||
                  location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="sidebar-text truncate">{link.text}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
