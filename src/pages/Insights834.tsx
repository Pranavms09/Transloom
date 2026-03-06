import { Layout } from "../components/Layout";
import { Users, UserPlus, UserMinus, UserCheck, Download } from "lucide-react";

const mockMembers = [
  {
    id: "MEM-001",
    name: "Sarah Jenkins",
    relation: "Subscriber",
    coverage: "Employee + Family",
    start: "2023-01-01",
    end: "2099-12-31",
    status: "Active",
  },
  {
    id: "MEM-002",
    name: "David Jenkins",
    relation: "Spouse",
    coverage: "Employee + Family",
    start: "2023-01-01",
    end: "2099-12-31",
    status: "Active",
  },
  {
    id: "MEM-003",
    name: "Emily Watson",
    relation: "Subscriber",
    coverage: "Employee Only",
    start: "2023-08-01",
    end: "2099-12-31",
    status: "Added",
  },
  {
    id: "MEM-004",
    name: "Michael Chang",
    relation: "Subscriber",
    coverage: "Employee + One",
    start: "2022-05-15",
    end: "2023-08-15",
    status: "Terminated",
  },
  {
    id: "MEM-005",
    name: "Lisa Chang",
    relation: "Spouse",
    coverage: "Employee + One",
    start: "2022-05-15",
    end: "2023-08-15",
    status: "Terminated",
  },
];

export function Insights834() {
  return (
    <Layout
      title="834 Member Enrollment"
      icon={<Users className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-300 dark:border-slate-700 pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Benefit Enrollment Maintenance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Summary of health plan member additions, terminations, and updates
              from the parsed 834 transaction.
            </p>
          </div>
          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition border border-gray-300 dark:border-slate-700">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-blue-500/30 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-blue-500/20 text-blue-500 p-3 rounded-xl border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">
                Total Members
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                5
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-3 rounded-xl border border-gray-300 dark:border-slate-700">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">
                Active
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                2
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-green-500/30 p-6 rounded-xl shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl"></div>
            <div className="bg-green-500/20 text-green-500 p-3 rounded-xl border border-green-500/30 z-10">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="z-10">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">
                Additions
              </p>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                1
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-red-500/30 p-6 rounded-xl shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="bg-red-500/20 text-red-500 p-3 rounded-xl border border-red-500/30 z-10">
              <UserMinus className="w-6 h-6" />
            </div>
            <div className="z-10">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">
                Terminations
              </p>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                2
              </h3>
            </div>
          </div>
        </div>

        {/* Member Table */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-none overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-1/12">Status</th>
                <th className="p-4 w-3/12">Member Name</th>
                <th className="p-4 w-2/12">Relationship</th>
                <th className="p-4 w-3/12">Coverage Type</th>
                <th className="p-4 w-1/12 text-center">Start Date</th>
                <th className="p-4 w-1/12 text-center">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {mockMembers.map((member, idx) => {
                let rowBg = "hover:bg-slate-50 dark:hover:bg-slate-800/30";
                let statusStyle =
                  "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/40 border-gray-300 dark:border-slate-700";

                if (member.status === "Added") {
                  rowBg =
                    "bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20";
                  statusStyle =
                    "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-800";
                } else if (member.status === "Terminated") {
                  rowBg =
                    "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20";
                  statusStyle =
                    "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-800";
                }

                return (
                  <tr key={idx} className={`${rowBg} transition group`}>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 border text-[10px] uppercase font-bold rounded ${statusStyle}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {member.name}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                      {member.relation}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                      {member.coverage}
                    </td>
                    <td className="p-4 text-center font-mono text-sm text-slate-700 dark:text-slate-300">
                      {member.start}
                    </td>
                    <td className="p-4 text-center font-mono text-sm text-slate-600 dark:text-slate-500">
                      {member.end}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
