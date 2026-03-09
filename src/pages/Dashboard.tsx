import { Layout } from "../components/Layout";
import {
  FileUp,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { useDashboardData } from "../hooks/useDashboardData";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const data = useDashboardData();
  const navigate = useNavigate();

  if (data.isLoading) {
    return (
      <Layout title="Dashboard" icon={<FileUp className="w-5 h-5 text-blue-500" />}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Aggregating processing data...</span>
          </div>
        </div>
      </Layout>
    );
  }

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
                {data.totalProcessed.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Files Processed
              </p>
            </div>
            {/* Add logic when there is time comparision available. Doing nothing for now */}
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
                {data.validTransactions.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Valid Transactions
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000" 
                  style={{ width: `${data.totalProcessed ? (data.validTransactions / data.totalProcessed) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-slate-600 dark:text-slate-500">
                {data.totalProcessed ? Math.round((data.validTransactions / data.totalProcessed) * 100) : 0}% Success Rate
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
                {data.filesWithErrors.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Files With Errors
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-1000" 
                  style={{ width: `${data.totalProcessed ? (data.filesWithErrors / data.totalProcessed) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-slate-600 dark:text-slate-500">
                {data.totalProcessed ? Math.round((data.filesWithErrors / data.totalProcessed) * 100) : 0}% Rejection Rate
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
                {data.totalValidationErrors.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Validation Errors
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <span>Avg {data.filesWithErrors ? (data.totalValidationErrors / data.filesWithErrors).toFixed(1) : 0} errors / rejected file</span>
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
              {data.errorBreakdown.length > 0 ? (
                data.errorBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-48 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
                      {item.label}
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-left text-xs text-slate-900 dark:text-slate-100 font-mono">
                      {item.count}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center flex-1 h-full text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    No errors found
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Type Distribution */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none p-4 md:p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-6">File Type Distribution</h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {data.fileTypeDistribution.length > 0 ? (
                data.fileTypeDistribution.map((item, i) => (
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
                ))
              ) : (
                <div className="flex items-center justify-center p-8 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl">
                  <span className="text-sm text-slate-400">No data available</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm dark:shadow-none overflow-hidden mt-4 md:mt-0">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Processing Activity</h3>
              <button onClick={() => navigate("/history")} className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium cursor-pointer">
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
                {data.recentActivity.length > 0 ? (
                  data.recentActivity.map((file, idx) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No EDI files processed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
