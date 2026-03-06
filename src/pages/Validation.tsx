import { Layout } from "../components/Layout";
import {
  ShieldAlert,
  Info,
  AlertTriangle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface ValidationIssue {
  id: string;
  segment: string;
  position: string;
  type: string;
  description: string;
  severity: "Critical" | "Warning" | "Info";
}

const mockIssues: ValidationIssue[] = [
  {
    id: "ERR-01",
    segment: "NM1*IL",
    position: "NM109",
    type: "Syntax Error",
    description: "Member Identification Code missing where qualifier is MI.",
    severity: "Critical",
  },
  {
    id: "ERR-02",
    segment: "CLM",
    position: "CLM02",
    type: "Business Logic",
    description:
      "Total Claim Charge Amount does not match sum of service line charges.",
    severity: "Critical",
  },
  {
    id: "WARN-01",
    segment: "DTP*435",
    position: "DTP03",
    type: "Data Formatting",
    description: "Admission Date is unusually old (>1 year). Please verify.",
    severity: "Warning",
  },
  {
    id: "INFO-01",
    segment: "REF*EA",
    position: "REF02",
    type: "Missing Optional",
    description: "Medical Record Number not provided. Processing can continue.",
    severity: "Info",
  },
];

export function Validation() {
  const metrics = {
    critical: mockIssues.filter((i) => i.severity === "Critical").length,
    warning: mockIssues.filter((i) => i.severity === "Warning").length,
    info: mockIssues.filter((i) => i.severity === "Info").length,
  };

  return (
    <Layout
      title="Validation Results"
      icon={<ShieldAlert className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-300 dark:border-slate-700 pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              X12 Adherence Reports
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Snip Level 1-7 syntax and business logic validation results.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm hover:border-red-500/50 transition">
            <div className="bg-red-500/20 text-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.critical}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Critical Rejections
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm hover:border-yellow-500/50 transition">
            <div className="bg-yellow-500/20 text-yellow-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.warning}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Warnings
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="bg-blue-500/20 text-blue-500 p-3 rounded-lg">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.info}</h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Info / Notices
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-1/12">Severity</th>
                <th className="p-4 w-2/12">Segment / Element</th>
                <th className="p-4 w-2/12">Error Type</th>
                <th className="p-4 w-5/12">Description</th>
                <th className="p-4 w-2/12 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {mockIssues.map((issue) => {
                const sevStyle =
                  issue.severity === "Critical"
                    ? "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800"
                    : issue.severity === "Warning"
                      ? "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-800"
                      : "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-800";

                return (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group"
                  >
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 border text-[10px] uppercase font-bold rounded ${sevStyle}`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                        {issue.segment}
                      </div>
                      <p className="text-[10px] uppercase mt-1 text-slate-600 dark:text-slate-500 font-semibold">
                        {issue.position}
                      </p>
                    </td>
                    <td className="p-4 font-medium text-sm text-slate-700 dark:text-slate-300">
                      {issue.type}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 pr-8">
                      {issue.description}
                    </td>
                    <td className="p-4 text-right">
                      <button className="flex items-center gap-2 justify-end ml-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 hover:text-slate-900 dark:text-slate-100 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg transition font-medium border border-gray-300 dark:border-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        Explain with AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
