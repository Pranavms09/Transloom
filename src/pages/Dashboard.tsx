import { Layout } from "../components/Layout";
import {
  FileUp,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

const recentFiles = [
  {
    name: "837P_Claims_Batch_Jan15.edi",
    type: "837 Professional",
    status: "Validated",
    errors: 0,
    date: "2 mins ago",
  },
  {
    name: "835_Remittance_BlueCross.edi",
    type: "835 Payment",
    status: "Warnings",
    errors: 3,
    date: "1 hour ago",
  },
  {
    name: "834_Enrollment_Q1.x12",
    type: "834 Enrollment",
    status: "Validated",
    errors: 0,
    date: "3 hours ago",
  },
  {
    name: "837I_Inst_Claims_Feb.dat",
    type: "837 Institutional",
    status: "Critical",
    errors: 12,
    date: "Yesterday",
  },
  {
    name: "999_Ack_Response.txt",
    type: "999 Acknowledgment",
    status: "Validated",
    errors: 0,
    date: "Yesterday",
  },
];

export function Dashboard() {
  return (
    <Layout
      title="Dashboard"
      icon={<FileUp className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Transaction Overview
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor your healthcare EDI parsing volume and validation adherence.
          </p>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                1,248
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Files Processed
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
              <span>+12% from last week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none relative overflow-hidden group hover:border-green-500/50 transition duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                1,102
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Valid Transactions
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-green-500 w-[88%] h-full"></div>
              </div>
              <span className="text-slate-600 dark:text-slate-500">
                88% Success Rate
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none relative overflow-hidden group hover:border-orange-500/50 transition duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                146
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Files With Errors
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 w-[12%] h-full"></div>
              </div>
              <span className="text-slate-600 dark:text-slate-500">
                12% Rejection Rate
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none relative overflow-hidden group hover:border-red-500/50 transition duration-300">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition duration-300"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                3,492
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Validation Errors
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <span>Avg 23.9 errors / rejected file</span>
            </div>
          </div>
        </div>

        {/* Charts & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Distribution */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none p-4 md:p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6">
              Validation Error Breakdown
            </h3>
            <div className="flex-1 flex flex-col justify-end space-y-4">
              {/* Simple CSS Bar Chart for MVP */}
              {[
                {
                  label: "Missing Required Element (Syntax)",
                  count: 1240,
                  percent: 100,
                  color: "bg-red-500",
                },
                {
                  label: "Segment Not Found",
                  count: 850,
                  percent: 68,
                  color: "bg-orange-500",
                },
                {
                  label: "Balancing Error (Logic)",
                  count: 620,
                  percent: 50,
                  color: "bg-blue-500",
                },
                {
                  label: "Invalid Format (Data Types)",
                  count: 480,
                  percent: 38,
                  color: "bg-purple-500",
                },
                {
                  label: "Too Many Elements",
                  count: 302,
                  percent: 24,
                  color: "bg-teal-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-48 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-left text-xs text-slate-900 dark:text-slate-100 font-mono">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none p-4 md:p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6">File Type Distribution</h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {[
                { label: "837 Claims", color: "bg-blue-500", percent: "45%" },
                {
                  label: "835 Remittance",
                  color: "bg-green-500",
                  percent: "30%",
                },
                {
                  label: "834 Enrollment",
                  color: "bg-purple-500",
                  percent: "15%",
                },
                {
                  label: "Others (277, 999)",
                  color: "bg-slate-500",
                  percent: "10%",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {item.percent}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none overflow-hidden mt-4 md:mt-0">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Processing Activity</h3>
              <button className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium">
                View All
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-4/12">File Name</th>
                  <th className="p-4 w-2/12">Transaction Type</th>
                  <th className="p-4 w-2/12 text-center">Status</th>
                  <th className="p-4 w-2/12 text-center">Errors</th>
                  <th className="p-4 w-2/12 text-right">Processed Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {recentFiles.map((file, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="p-4 font-mono text-sm text-slate-900 dark:text-slate-100 font-medium">
                      {file.name}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                      {file.type}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {file.status === "Validated" ? (
                          <span className="flex items-center gap-1 text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-800 px-2 py-1 rounded text-xs font-bold uppercase">
                            <CheckCircle className="w-3 h-3" /> Valid
                          </span>
                        ) : file.status === "Warnings" ? (
                          <span className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-800 px-2 py-1 rounded text-xs font-bold uppercase">
                            <AlertTriangle className="w-3 h-3" /> Warn
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-800 px-2 py-1 rounded text-xs font-bold uppercase">
                            <XCircle className="w-3 h-3" /> Error
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                      {file.errors > 0 ? (
                        <span
                          className={
                            file.status === "Critical"
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }
                        >
                          {file.errors}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right text-sm text-slate-600 dark:text-slate-500 font-medium">
                      {file.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
