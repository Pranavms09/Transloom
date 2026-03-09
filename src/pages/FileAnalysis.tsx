import { Layout } from "../components/Layout";
import {
  AlertTriangle,
  Bot,
  Activity,
  Layers,
  Upload,
  Download,
  Calendar,
  Users,
  Info,
  Package,
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
          <Upload className="w-16 h-16 text-slate-300 mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">No File Loaded</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Please upload an EDI file first to view its analysis, parsed structure, and validation results.
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition"
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

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case "high": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "medium": return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      case "low": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      default: return "bg-slate-50 text-slate-700 border-gray-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
    }
  };

  return (
    <Layout
      title="File Analysis Dashboard"
      icon={<Activity className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mr-2">
                {aiAnalysis.fileType || "EDI"}
              </span>
              Analysis Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Clear, human-readable breakdown of the extracted EDI contents.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button
               onClick={() => window.print()}
               className="hidden md:flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold border border-gray-200 dark:border-slate-700 shadow-sm transition print:hidden cursor-pointer"
             >
               <Download className="w-4 h-4" />
               Download PDF
             </button>
             <div className={`px-4 py-2 rounded-full font-bold text-sm border shadow-sm ${aiAnalysis.errors?.length ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800/50' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'}`}>
               {aiAnalysis.errors?.length || 0} Issues Found
             </div>
          </div>
        </div>

        {/* 1. File Information & Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* File Information */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-all duration-500" />
             <h3 className="text-lg font-bold mb-5 flex items-center gap-2 relative z-10 text-slate-800 dark:text-slate-200">
              <Info className="w-5 h-5 text-blue-500" />
              File Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
              {Object.entries(aiAnalysis.fileInformation || {}).map(([key, val]) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 capitalize">
                     {key.replace(/([A-Z])/g, ' $1').trim()}
                   </p>
                   <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={val as string}>
                     {val || "—"}
                   </p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Overview */}
          <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20 transition-all duration-500" />
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 relative z-10 text-slate-800 dark:text-slate-200">
              <Layers className="w-5 h-5 text-indigo-500" />
              Transaction Highlights
            </h3>
            <div className="space-y-4 relative z-10">
               {Object.entries(aiAnalysis.transactionOverview || {}).map(([key, val]) => (
                 <div key={key} className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {val || "—"}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* 2. Participants and Dates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Participants */}
          <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Users className="w-5 h-5 text-emerald-500" />
              Participants
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiAnalysis.participants || {}).map(([key, val]) => (
                 <div key={key} className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center text-center justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">{key}</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{val || "Not Specified"}</span>
                 </div>
              ))}
            </div>
          </div>

          {/* Important Dates (Timeline) */}
          <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Calendar className="w-5 h-5 text-purple-500" />
              Important Dates
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
              {aiAnalysis.importantDates?.length ? aiAnalysis.importantDates.map((dateObj, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{dateObj.label}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{dateObj.value}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">No important dates extracted.</p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Line Items Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
           <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Package className="w-5 h-5 text-amber-500" />
                Line Items ({aiAnalysis.lineItems?.length || 0})
              </h3>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left bg-transparent">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700/50">
                    <tr>
                      <th className="p-4 pl-6">Item #</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4 text-right">Qty</th>
                      <th className="p-4 text-right">Unit Price</th>
                      <th className="p-4 text-right pr-6">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {aiAnalysis.lineItems?.length ? aiAnalysis.lineItems.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 pl-6 font-mono text-sm text-slate-600 dark:text-slate-400">{item.itemNumber || "—"}</td>
                        <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{item.productName || "—"}</td>
                        <td className="p-4 text-right text-slate-600 dark:text-slate-400">{item.quantity || 0}</td>
                        <td className="p-4 text-right text-slate-600 dark:text-slate-400 font-mono">{item.unitPrice || "—"}</td>
                        <td className="p-4 text-right pr-6 font-bold text-slate-800 dark:text-slate-200 font-mono">{item.totalPrice || "—"}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No line items found in this file.</td>
                      </tr>
                    )}
                  </tbody>
              </table>
           </div>
        </div>

        {/* 4. Validation Errors Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Validation Checks
          </h3>
          
          {!aiAnalysis.errors?.length ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 p-4 md:p-6 rounded-xl md:rounded-2xl flex items-center justify-center gap-3">
               <Activity className="w-5 h-5" />
               <p className="font-semibold">No validation errors found! Your file is perfectly formatted.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {aiAnalysis.errors.map((err, i) => (
                 <div key={i} className={`p-4 md:p-5 rounded-xl md:rounded-2xl border ${getSeverityColor(err.severity)} shadow-sm flex flex-col h-full`}>
                    <div className="flex justify-between items-start mb-3">
                       <span className="inline-block px-2.5 py-1 bg-white/50 dark:bg-black/20 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                         {err.severity || "Error"}
                       </span>
                       <span className="font-mono text-sm font-bold bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                         Segment: {err.segment || "Unknown"}
                       </span>
                    </div>
                    <p className="text-sm font-medium mb-1 opacity-80">Element: {err.elementPosition || "N/A"}</p>
                    <p className="text-base font-semibold mb-6 flex-1">{err.description || "Unknown error occurred"}</p>
                    
                    <button 
                      onClick={() => handleExplain(err.description || "")}
                      className="mt-auto w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 rounded-xl text-sm font-bold transition shadow-sm"
                    >
                      <Bot className="w-4 h-4" />
                      Explain with AI Assistant
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
