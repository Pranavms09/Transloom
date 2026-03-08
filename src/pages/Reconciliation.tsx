import { Layout } from "../components/Layout";
import { useEDI } from "../contexts/EDIContext";
import { reconcileClaims } from "../lib/reconciliation";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

export function Reconciliation() {
  const { batchFiles, parsedFile } = useEDI();
  
  // We can reconcile across the single uploaded file or the whole batch
  const filesToReconcile = useMemo(() => {
    if (batchFiles.length > 0) return batchFiles.map(bf => bf.parsed);
    if (parsedFile) return [parsedFile];
    return [];
  }, [batchFiles, parsedFile]);

  const matches = useMemo(() => reconcileClaims(filesToReconcile), [filesToReconcile]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"All" | "Matched" | "Unmatched 837" | "Unmatched 835" | "Denied">("All");

  const filteredMatches = matches.filter(m => {
    const term = searchTerm.toLowerCase();
    const searchMatch = m.claimId.toLowerCase().includes(term) || m.patientName.toLowerCase().includes(term);
    const filterMatch = filter === "All" || m.status.includes(filter);
    return searchMatch && filterMatch;
  });

  return (
    <Layout title="Claim Reconciliation (837 ↔ 835)" icon={<Filter className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reconciliation Engine</h2>
            <p className="text-slate-600 dark:text-slate-400">Match billed active 837 claims against 835 remittances.</p>
          </div>

          <div className="flex gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Claim ID or Patient..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pb-2 overflow-x-auto">
          {["All", "Matched", "Denied", "Unmatched 837", "Unmatched 835"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Claim ID</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4 text-right">Billed (837)</th>
                  <th className="p-4 text-right">Paid (835)</th>
                  <th className="p-4 text-right">Difference</th>
                  <th className="p-4">Adjustments</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No matching claims found for the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map((claim, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{claim.claimId}</td>
                      <td className="p-4 text-sm font-medium">{claim.patientName}</td>
                      <td className="p-4 text-right font-mono text-sm">${claim.billedAmount.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-sm text-green-600 dark:text-green-400">${claim.paidAmount.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-sm group relative">
                        {claim.difference > 0 ? (
                           <span className="text-amber-600 dark:text-amber-500">-${claim.difference.toFixed(2)}</span>
                        ) : claim.difference < 0 ? (
                           <span className="text-green-600 dark:text-green-500">+${Math.abs(claim.difference).toFixed(2)}</span>
                        ) : (
                           <span className="text-slate-500">$0.00</span>
                        )}
                      </td>
                      <td className="p-4 text-sm max-w-xs">
                        {claim.adjustments.slice(0, 2).map((adj, i) => (
                          <div key={i} className="mb-0.5 last:mb-0">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{adj.code}</span>: ${adj.amount.toFixed(2)}
                            <div className="text-[10px] text-slate-500 leading-tight line-clamp-1" title={adj.desc}>{adj.desc}</div>
                          </div>
                        ))}
                        {claim.adjustments.length > 2 && <span className="text-xs text-slate-400">+{claim.adjustments.length - 2} more</span>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide
                          ${claim.status.includes('Matched') || claim.status === 'Paid in Full' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : ''}
                          ${claim.status.includes('Denied') ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : ''}
                          ${claim.status === 'Partial Payment' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : ''}
                          ${claim.status.includes('Unmatched') ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : ''}
                        `}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
