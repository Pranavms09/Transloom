import { Layout } from "../components/Layout";
import { DollarSign, FileText, Download } from "lucide-react";

const mockPayments = [
  {
    id: "CLM-99382",
    billed: "$250.00",
    paid: "$180.00",
    adjustment: "Contractual Obligation ($70.00)",
    patientResp: "$0.00",
    status: "Paid",
  },
  {
    id: "CLM-88211",
    billed: "$450.00",
    paid: "$400.00",
    adjustment: "Co-insurance ($50.00)",
    patientResp: "$50.00",
    status: "Paid",
  },
  {
    id: "CLM-77102",
    billed: "$150.00",
    paid: "$0.00",
    adjustment: "Service not covered ($150.00)",
    patientResp: "$150.00",
    status: "Denied",
  },
  {
    id: "CLM-66099",
    billed: "$800.00",
    paid: "$700.00",
    adjustment: "Deductible ($100.00)",
    patientResp: "$100.00",
    status: "Paid",
  },
  {
    id: "CLM-55988",
    billed: "$300.00",
    paid: "$220.00",
    adjustment: "Contractual Obligation ($80.00)",
    patientResp: "$0.00",
    status: "Paid",
  },
];

export function Insights835() {
  return (
    <Layout
      title="835 Payment Summary"
      icon={<DollarSign className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-300 dark:border-slate-700 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Electronic Remittance Advice (ERA)
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Summary of claims, payment amounts, and adjustment logic from the
              parsed 835 transaction.
            </p>
          </div>
          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition border border-gray-300 dark:border-slate-700">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Big Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-green-500/30 p-6 rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl"></div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Total Paid
            </p>
            <h3 className="text-3xl font-bold text-green-600 dark:text-green-400">
              $1,500.00
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-300 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Total Billed
            </p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              $1,950.00
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-300 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Adjustments
            </p>
            <h3 className="text-3xl font-bold text-yellow-500">$450.00</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Patient Resp.
            </p>
            <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              $300.00
            </h3>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Parsed Claims
            </h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-2/12">Claim ID (CLP01)</th>
                <th className="p-4 w-1/12 text-right">Billed</th>
                <th className="p-4 w-1/12 text-right">Paid</th>
                <th className="p-4 w-4/12">Adjustment Reason (CAS)</th>
                <th className="p-4 w-2/12 text-right">Patient Resp.</th>
                <th className="p-4 w-2/12 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {mockPayments.map((payment, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition group"
                >
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {payment.id}
                  </td>
                  <td className="p-4 text-right text-slate-700 dark:text-slate-300 font-mono text-sm">
                    {payment.billed}
                  </td>
                  <td className="p-4 text-right text-green-600 dark:text-green-400 font-mono font-bold text-sm">
                    {payment.paid}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 text-sm truncate max-w-[200px]">
                    {payment.adjustment}
                  </td>
                  <td className="p-4 text-right text-purple-600 dark:text-purple-400 font-mono text-sm">
                    {payment.patientResp}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 border text-[10px] uppercase font-bold rounded ${
                        payment.status === "Paid"
                          ? "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-800"
                          : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
