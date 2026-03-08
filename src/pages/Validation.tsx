import { useState } from "react";
import { Layout } from "../components/Layout";
import {
  ShieldAlert, Info, AlertTriangle, AlertCircle,
  Sparkles, Download, FileJson, Upload, CheckCircle
} from "lucide-react";
import { useEDI } from "../contexts/EDIContext";
import { ValidationIssue, getValidationSummary } from "../lib/validator";
import { useNavigate } from "react-router-dom";
import { exportValidationCSV, exportPDFReport, exportJSON } from "../lib/exportUtils";

function SeverityBadge({ severity }: { severity: ValidationIssue["severity"] }) {
  const styles = {
    Critical: "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800",
    Warning: "text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-800",
    Info: "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-800",
  };
  return (
    <span className={`px-2 py-1 border text-[10px] uppercase font-bold rounded ${styles[severity]}`}>
      {severity}
    </span>
  );
}

type FilterType = "All" | "Critical" | "Warning" | "Info";

export function Validation() {
  const { validationResults, parsedFile, setSelectedSegmentIndex } = useEDI();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("All");

  const summary = getValidationSummary(validationResults);

  const filtered = filter === "All"
    ? validationResults
    : validationResults.filter((i) => i.severity === filter);

  const hasFile = !!parsedFile;

  if (!hasFile) {
    return (
      <Layout title="Validation Results" icon={<ShieldAlert className="w-5 h-5 text-blue-500" />}>
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
          <ShieldAlert className="w-20 h-20 text-slate-300 dark:text-slate-700 mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No File to Validate</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Upload an EDI file first to see HIPAA 5010 validation results.</p>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Upload className="w-4 h-4" /> Upload EDI File
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Validation Results"
      icon={<ShieldAlert className="w-5 h-5 text-blue-500" />}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => exportJSON(validationResults, `${parsedFile?.fileInfo.name || "validation"}_errors.json`)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg transition font-medium border border-gray-200 dark:border-slate-700"
          >
            <FileJson className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={() => exportValidationCSV(validationResults, `${parsedFile?.fileInfo.name || "validation"}_errors.csv`)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg transition font-medium border border-gray-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => parsedFile && exportPDFReport(validationResults, parsedFile.fileInfo)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg transition font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> PDF Report
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-5 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">X12 Adherence Report</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              HIPAA 5010 validation for{" "}
              <span className="font-mono text-blue-600 dark:text-blue-400">{parsedFile.fileInfo.name}</span>
              {" ·"} {parsedFile.fileInfo.type} · {parsedFile.fileInfo.segmentCount} segments
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Critical Errors", count: summary.critical, icon: AlertTriangle, color: "red", filter: "Critical" as FilterType },
            { label: "Warnings", count: summary.warning, icon: AlertCircle, color: "yellow", filter: "Warning" as FilterType },
            { label: "Info Notices", count: summary.info, icon: Info, color: "blue", filter: "Info" as FilterType },
            {
              label: summary.passed ? "Passed ✓" : "Total Issues",
              count: summary.total,
              icon: summary.passed ? CheckCircle : ShieldAlert,
              color: summary.passed ? "green" : "slate",
              filter: "All" as FilterType,
            },
          ].map((card) => (
            <button
              key={card.label}
              onClick={() => setFilter(card.filter)}
              className={`bg-white dark:bg-slate-800 border rounded-xl p-5 flex items-center gap-4 shadow-sm text-left transition hover:border-${card.color}-400 ${
                filter === card.filter ? `border-${card.color}-500` : "border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className={`bg-${card.color}-500/20 text-${card.color}-500 p-3 rounded-lg flex-shrink-0`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.count}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(["All", "Critical", "Warning", "Info"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f} {f === "All" ? `(${summary.total})` : f === "Critical" ? `(${summary.critical})` : f === "Warning" ? `(${summary.warning})` : `(${summary.info})`}
            </button>
          ))}
        </div>

        {/* Results Table */}
        {filtered.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
              {filter === "All" ? "All Checks Passed!" : `No ${filter} Issues`}
            </h3>
            <p className="text-green-600 dark:text-green-500 text-sm">
              {filter === "All"
                ? "This EDI file passed all HIPAA 5010 validation checks."
                : `There are no ${filter.toLowerCase()} level issues in this file.`}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-[90px]">Severity</th>
                  <th className="p-4 w-[130px]">Segment</th>
                  <th className="p-4 w-[80px]">Position</th>
                  <th className="p-4 w-[130px]">Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 w-[110px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filtered.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group">
                    <td className="p-4"><SeverityBadge severity={issue.severity} /></td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">{issue.segment}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {issue.position}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{issue.type}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400 pr-4">{issue.description}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {issue.id && issue.id.includes("-") && (
                          <button
                            onClick={() => {
                              // We use the segment position or id if it ends with -idx. 
                              // Our validator appends the segment index to some issue IDs (e.g. NM1-001-4)
                              // or position might hold information.
                              // Actually, the validator attaches `segment.index` to issue ID for some, but let's 
                              // extract the index if it exists. 
                              const match = issue.id.match(/-(\d+)$/);
                              if (match) {
                                setSelectedSegmentIndex(parseInt(match[1], 10));
                                navigate("/explorer/raw");
                              }
                            }}
                            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-800 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg transition font-medium border border-gray-200 dark:border-slate-700"
                            title="View Segment in File Explorer"
                          >
                            View
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/ai/ask?q=${encodeURIComponent("Explain this error: " + issue.description)}`)}
                          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-800 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg transition font-medium border border-gray-200 dark:border-slate-700"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Explain
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
