import { Layout } from "../components/Layout";
import { DollarSign, FileText, Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { useEDI } from "../contexts/EDIContext";
import { useNavigate } from "react-router-dom";
import { export835CSV, exportJSON } from "../lib/exportUtils";
import { CLP835 } from "../lib/x12Parser";
// @ts-ignore
import crcMap from "../lib/carcdesc.json";

function clpStatus(code: string) {
  if (["4", "4X"].includes(code) || code.startsWith("D")) return "Denied";
  return "Paid";
}

export function Insights835() {
  const { parsedFile } = useEDI();
  const navigate = useNavigate();

  const clpLoops: CLP835[] = parsedFile?.clpLoops || [];
  const isLoaded = !!parsedFile && parsedFile.fileInfo.type === "835";

  const totalBilled = clpLoops.reduce((a, c) => a + c.billedAmount, 0);
  const totalPaid = clpLoops.reduce((a, c) => a + c.paidAmount, 0);
  const totalAdj = clpLoops.reduce((a, c) => a + c.adjustments.reduce((s, d) => s + d.amount, 0), 0);
  const totalPatient = clpLoops.reduce((a, c) => a + c.patientResponsibility, 0);

  if (!isLoaded) {
    return (
      <Layout title="835 Payment Summary" icon={<DollarSign className="w-5 h-5 text-blue-500" />}>
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
          <DollarSign className="w-20 h-20 text-slate-300 dark:text-slate-700 mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No 835 File Loaded</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {parsedFile
              ? `Loaded file is a ${parsedFile.fileInfo.type}, not an 835 ERA.`
              : "Upload an 835 Electronic Remittance Advice file to see payment details."}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Upload className="w-4 h-4" /> Upload 835 File
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="835 Payment Summary"
      icon={<DollarSign className="w-5 h-5 text-blue-500" />}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => export835CSV(clpLoops, `${parsedFile.fileInfo.name}_835.csv`)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg font-medium border border-gray-200 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => exportJSON(clpLoops, `${parsedFile.fileInfo.name}_835.json`)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-7 border-b border-gray-200 dark:border-slate-700 pb-5">
          <h2 className="text-2xl font-bold tracking-tight">Electronic Remittance Advice (ERA)</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            <span className="font-mono text-blue-600 dark:text-blue-400">{parsedFile.fileInfo.name}</span>
            {" · "}{clpLoops.length} claims parsed
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Paid", value: `$${totalPaid.toFixed(2)}`, color: "text-green-600 dark:text-green-400", border: "border-green-500/30" },
            { label: "Total Billed", value: `$${totalBilled.toFixed(2)}`, color: "text-slate-900 dark:text-slate-100", border: "border-gray-200 dark:border-slate-700" },
            { label: "Adjustments", value: `$${totalAdj.toFixed(2)}`, color: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/30" },
            { label: "Patient Responsibility", value: `$${totalPatient.toFixed(2)}`, color: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
          ].map((card) => (
            <div key={card.label} className={`bg-white dark:bg-slate-800 border ${card.border} p-5 rounded-xl shadow-sm`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{card.label}</p>
              <h3 className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</h3>
            </div>
          ))}
        </div>

        {/* Claims table */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">CLP Claim Lines ({clpLoops.length})</h3>
          </div>
          {clpLoops.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No CLP segments found in this 835 file.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Claim ID (CLP01)</th>
                    <th className="p-4 text-right">Billed</th>
                    <th className="p-4 text-right">Paid</th>
                    <th className="p-4">Adjustments (CAS)</th>
                    <th className="p-4 text-right">Patient Resp.</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {clpLoops.map((clp, idx) => {
                    const status = clpStatus(clp.statusCode);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{clp.claimId}</td>
                        <td className="p-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">${clp.billedAmount.toFixed(2)}</td>
                        <td className="p-4 text-right font-mono font-bold text-sm text-green-600 dark:text-green-400">${clp.paidAmount.toFixed(2)}</td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-[240px]">
                          {clp.adjustments.length === 0 ? (
                            <span className="text-slate-400 italic">None</span>
                          ) : (
                            clp.adjustments.slice(0, 2).map((adj, i) => {
                              const codeKey = `${adj.groupCode}${adj.reasonCode}`;
                              // @ts-ignore
                              const desc = crcMap[codeKey] || crcMap[adj.reasonCode] || "";
                              return (
                                <div key={i} className="text-xs mb-1 last:mb-0">
                                  <div className="flex justify-between">
                                    <span className="font-semibold text-blue-700 dark:text-blue-400">{adj.groupCode}/{adj.reasonCode}</span>
                                    <span>${adj.amount.toFixed(2)}</span>
                                  </div>
                                  {desc && <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</div>}
                                </div>
                              );
                            })
                          )}
                          {clp.adjustments.length > 2 && (
                            <div className="text-xs text-slate-400 mt-1">+{clp.adjustments.length - 2} more</div>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-purple-600 dark:text-purple-400">${clp.patientResponsibility.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className={`flex items-center justify-center gap-1.5 px-2 py-1 border text-[10px] uppercase font-bold rounded ${
                            status === "Paid"
                              ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-800"
                              : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800"
                          }`}>
                            {status === "Paid" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
