import { Layout } from "../components/Layout";
import { useEDI } from "../contexts/EDIContext";
import { Layers, FileJson, ShieldCheck, DollarSign, Activity, FileText } from "lucide-react";
import { useMemo } from "react";

export function BatchDashboard() {
  const { batchFiles } = useEDI();

  const stats = useMemo(() => {
    let totalSegments = 0;
    let totalErrors = 0;
    let claimCount837 = 0;
    let paymentCount835 = 0;
    let billedTotal = 0;
    let paidTotal = 0;

    for (const bf of batchFiles) {
      totalSegments += bf.parsed.fileInfo.segmentCount;
      totalErrors += bf.issues.length;

      if (bf.parsed.fileInfo.type === "837P" || bf.parsed.fileInfo.type === "837I") {
        const claims = bf.parsed.claimLoops || [];
        claimCount837 += claims.length;
        billedTotal += claims.reduce((acc, c) => acc + c.totalCharges, 0);
      } else if (bf.parsed.fileInfo.type === "835") {
        const clps = bf.parsed.clpLoops || [];
        paymentCount835 += clps.length;
        paidTotal += clps.reduce((acc, c) => acc + c.paidAmount, 0);
      }
    }

    return { totalSegments, totalErrors, claimCount837, paymentCount835, billedTotal, paidTotal };
  }, [batchFiles]);

  if (batchFiles.length === 0) {
    return (
      <Layout title="Batch Dashboard" icon={<Layers className="w-5 h-5 text-blue-500" />}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-lg mx-auto">
          <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
          <h2 className="text-xl font-bold mb-2">No Batch Uploaded</h2>
          <p className="text-slate-500">Upload a ZIP file containing multiple EDI files to view batch analytics.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Batch Dashboard" icon={<Layers className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batch Processing Summary</h2>
          <p className="text-slate-600 dark:text-slate-400">Aggregated insights across {batchFiles.length} uploaded files</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Files Parsed" value={batchFiles.length} icon={<FileJson className="w-5 h-5 text-blue-500" />} />
          <StatCard title="Total Segments" value={stats.totalSegments.toLocaleString()} icon={<Activity className="w-5 h-5 text-purple-500" />} />
          <StatCard title="Validation Issues" value={stats.totalErrors} icon={<ShieldCheck className="w-5 h-5 text-red-500" />} />
          <StatCard title="Total Claims (837)" value={stats.claimCount837} icon={<FileText className="w-5 h-5 text-teal-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-10">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Billed Volume (837)</div>
              <div className="text-4xl font-black text-slate-800 dark:text-slate-100">${stats.billedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-10">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                 <DollarSign className="w-4 h-4 text-green-500" /> Total Paid Volume (835)
              </div>
              <div className="text-4xl font-black text-green-600 dark:text-green-400">${stats.paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm">
            Batch File Details
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Segments</th>
                  <th className="p-4 text-right">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {batchFiles.map((bf, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                    <td className="p-4 font-medium">{bf.name}</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold">{bf.parsed.fileInfo.type}</span></td>
                    <td className="p-4 text-right font-mono">{bf.parsed.fileInfo.segmentCount}</td>
                    <td className="p-4 text-right">
                      {bf.issues.length === 0 ? (
                        <span className="text-green-500 text-xs font-bold">Passed</span>
                      ) : (
                        <span className="text-red-500 font-mono">{bf.issues.length}</span>
                      )}
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

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</div>
      </div>
    </div>
  );
}
