import { Layout } from "../components/Layout";
import {
  FileText,
  AlertTriangle,
  Bot,
  Activity,
  Layers,
  Upload,
} from "lucide-react";
import { useEDI } from "../contexts/EDIContext";
import { useNavigate } from "react-router-dom";

export function FileAnalysis() {
  const { aiAnalysis } = useEDI();
  const navigate = useNavigate();

  if (!aiAnalysis) {
    return (
      <Layout title="File Analysis" icon={<Activity className="w-5 h-5 text-blue-500" />}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
          <Upload className="w-16 h-16 text-slate-300 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No File Loaded</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Please upload an EDI file first to view its analysis, parsed structure, and validation results.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Upload File
          </button>
        </div>
      </Layout>
    );
  }

  const handleExplain = (msg: string) => {
    navigate(`/ai?q=${encodeURIComponent("Please explain this validation error: " + msg)}`);
  };

  const renderDynamicObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(obj).map(([key, val]) => (
          <div key={key} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout
      title="File Analysis"
      icon={<Activity className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            AI Analysis Report
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Review Gemini's summary and HIPAA validation checks for your uploaded file.
          </p>
        </div>

        {/* 1. File Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Detected File Type</h3>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold font-mono text-blue-700 dark:text-blue-300">{aiAnalysis.fileType || "Unknown"}</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
             <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</h3>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold font-mon text-green-600 dark:text-green-400">Processed</span>
            </div>
          </div>

          <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border shadow-sm flex flex-col justify-center border-l-4 ${aiAnalysis.errors?.length > 0 ? 'border-l-red-500 border-gray-200 dark:border-slate-700' : 'border-l-green-500 border-gray-200 dark:border-slate-700'}`}>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Validation Errors</h3>
            <div className="flex items-center gap-2">
              {aiAnalysis.errors?.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Activity className="w-5 h-5 text-green-500" />
              )}
              <span className={`text-2xl font-bold font-mono ${aiAnalysis.errors?.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {aiAnalysis.errors?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 2. Summary Viewer */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              High-level Summary
            </h3>
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-100 dark:border-slate-700/50">
               {renderDynamicObject(aiAnalysis.summary)}
            </div>
          </div>

          {/* 3. Human Readable Data */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Extracted Data
            </h3>
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl p-6 overflow-y-auto border border-gray-100 dark:border-slate-700/50">
               {renderDynamicObject(aiAnalysis.readableData)}
            </div>
          </div>
        </div>

        {/* 4. Validation Errors */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${aiAnalysis.errors?.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
              <AlertTriangle className="w-5 h-5" />
              Validation Errors ({aiAnalysis.errors?.length || 0})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {!aiAnalysis.errors || aiAnalysis.errors.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No validation errors found! Your file is clean.
              </div>
            ) : (
              <table className="w-full text-left bg-transparent">
                <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-1/12">Segment / Issue</th>
                    <th className="p-4 w-6/12">Error Message</th>
                    <th className="p-4 w-3/12 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {aiAnalysis.errors.map((err, i) => {
                     const isStr = typeof err === 'string';
                     return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {isStr ? "Validation Issue" : (err.segment || err.type || "Validation Issue")}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                          {isStr ? err : (err.description || err.message || JSON.stringify(err))}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleExplain(isStr ? err : (err.description || err.message || JSON.stringify(err)))}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition"
                          >
                            <Bot className="w-4 h-4" />
                            Explain with AI
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
