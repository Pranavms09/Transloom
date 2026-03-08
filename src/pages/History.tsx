import { useState } from "react";
import { Layout } from "../components/Layout";
import {
  History as HistoryIcon,
  FileText,
  AlertTriangle,
  Activity,
  Trash2,
  Eye,
  Calendar,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import { useEDI, type HistoryEntry } from "../contexts/EDIContext";
import { useNavigate } from "react-router-dom";

function timeAgo(isoString: string): string {
  const now = Date.now();
  const diff = now - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSeverityBadge(errors: HistoryEntry["analysis"]["errors"]) {
  if (!errors?.length) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <Activity className="w-3 h-3" /> Clean
      </span>
    );
  }
  const hasHigh = errors.some((e) => e.severity?.toLowerCase() === "high");
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${hasHigh ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}>
      <AlertTriangle className="w-3 h-3" /> {errors.length} issue{errors.length !== 1 ? "s" : ""}
    </span>
  );
}

export function History() {
  const { history, historyLoading, removeHistoryEntry, clearHistory, loadAnalysisOnly } = useEDI();
  const navigate = useNavigate();
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const loadEntry = (entry: HistoryEntry) => {
    // Re-hydrate the analysis context from history WITHOUT saving a new Firestore entry
    loadAnalysisOnly(entry.analysis);
    navigate("/analysis");
  };

  if (historyLoading) {
    return (
      <Layout title="Upload History" icon={<HistoryIcon className="w-5 h-5 text-purple-500" />}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading your history from the cloud…</p>
        </div>
      </Layout>
    );
  }

  if (history.length === 0) {
    return (
      <Layout title="Upload History" icon={<HistoryIcon className="w-5 h-5 text-purple-500" />}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6">
            <PackageOpen className="w-10 h-10 text-purple-300 dark:text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No History Yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Upload your first EDI file and it will appear here automatically.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Upload a File
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Upload History" icon={<HistoryIcon className="w-5 h-5 text-purple-500" />}>
      <div className="max-w-6xl mx-auto w-full space-y-6 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1 text-slate-900 dark:text-white">
              Upload History
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {history.length} file{history.length !== 1 ? "s" : ""} analyzed — click any report to reload it
            </p>
          </div>
          <button
            onClick={() => setConfirmClearAll(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Clear All Confirmation Banner */}
        {confirmClearAll && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <p className="font-semibold text-red-700 dark:text-red-400">
              Are you sure you want to delete all history? This cannot be undone.
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="px-4 py-2 text-sm font-bold rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearHistory(); setConfirmClearAll(false); }}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
              >
                Delete All
              </button>
            </div>
          </div>
        )}

        {/* History Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5 xl:gap-6">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 border-b border-gray-100 dark:border-slate-700/50 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-800 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-sm" title={entry.fileName}>
                      {entry.fileName}
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 mt-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 inline-block">
                      {entry.analysis.fileType || "EDI"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeHistoryEntry(entry); }}
                  className="w-7 h-7 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 md:p-5 flex-1 space-y-3">
                {/* Timestamps */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span title={formatDate(entry.uploadedAt)}>{timeAgo(entry.uploadedAt)}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{formatDate(entry.uploadedAt)}</span>
                </div>

                {/* Validation Status */}
                {getSeverityBadge(entry.analysis.errors)}

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-2">
                  {entry.analysis.transactionOverview?.transactionType && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-0.5">Type</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{entry.analysis.transactionOverview.transactionType}</p>
                    </div>
                  )}
                  {entry.analysis.participants?.sender && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-0.5">Sender</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{entry.analysis.participants.sender}</p>
                    </div>
                  )}
                  {entry.analysis.transactionOverview?.transactionDate && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-0.5">Date</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{entry.analysis.transactionOverview.transactionDate}</p>
                    </div>
                  )}
                  {entry.analysis.lineItems !== undefined && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg">
                      <p className="text-xs text-slate-400 mb-0.5">Line Items</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{entry.analysis.lineItems.length}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer - Action */}
              <div className="px-4 pb-4 md:px-5 md:pb-5">
                <button
                  onClick={() => loadEntry(entry)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition mx-auto"
                >
                  <Eye className="w-4 h-4" />
                  View Full Report
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
