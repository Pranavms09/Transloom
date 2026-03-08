import { Layout } from "../components/Layout";
import { Users, Download, Upload, UserCheck, UserMinus } from "lucide-react";
import { useEDI } from "../contexts/EDIContext";
import { useNavigate } from "react-router-dom";
import { export834CSV, exportJSON } from "../lib/exportUtils";
import { Member834 } from "../lib/x12Parser";

const RELATIONSHIP_LABEL: Record<string, string> = {
  "18": "Self", "01": "Spouse", "19": "Child", "34": "Other Adult",
  "G8": "Other Relationship", "15": "Stepchild", "17": "Grandchild",
  "53": "Life Partner", "29": "Significant Other",
};

function GenderBadge({ gender }: { gender: string }) {
  if (gender === "M") return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded border border-blue-300 dark:border-blue-800">M</span>;
  if (gender === "F") return <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400 text-[10px] font-bold rounded border border-pink-300 dark:border-pink-800">F</span>;
  return <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded border border-gray-200 dark:border-slate-700">{gender || "–"}</span>;
}

export function Insights834() {
  const { parsedFile } = useEDI();
  const navigate = useNavigate();

  const members: Member834[] = parsedFile?.memberLoops || [];
  const isLoaded = !!parsedFile && parsedFile.fileInfo.type === "834";

  const subscribers = members.filter((m) => m.subscriberIndicator === "Y");
  const dependents = members.filter((m) => m.subscriberIndicator === "N");
  const active = members.filter((m) => !m.termDate || m.termDate === "Active");

  if (!isLoaded) {
    return (
      <Layout title="834 Member Enrollment" icon={<Users className="w-5 h-5 text-blue-500" />}>
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
          <Users className="w-20 h-20 text-slate-300 dark:text-slate-700 mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No 834 File Loaded</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {parsedFile
              ? `Loaded file is a ${parsedFile.fileInfo.type}, not an 834.`
              : "Upload an 834 Benefit Enrollment file to see member details."}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Upload className="w-4 h-4" /> Upload 834 File
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="834 Member Enrollment"
      icon={<Users className="w-5 h-5 text-blue-500" />}
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => export834CSV(members, `${parsedFile.fileInfo.name}_members.csv`)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3 py-2 rounded-lg font-medium border border-gray-200 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => exportJSON(members, `${parsedFile.fileInfo.name}_members.json`)}
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
          <h2 className="text-2xl font-bold tracking-tight">Benefit Enrollment Summary</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            <span className="font-mono text-blue-600 dark:text-blue-400">{parsedFile.fileInfo.name}</span>
            {" · "}{members.length} members parsed
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Members", value: members.length, icon: Users, color: "blue" },
            { label: "Subscribers", value: subscribers.length, icon: UserCheck, color: "green" },
            { label: "Dependents", value: dependents.length, icon: Users, color: "purple" },
            { label: "Active Enrollments", value: active.length, icon: UserCheck, color: "teal" },
          ].map((card) => (
            <div key={card.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-xl shadow-sm">
              <div className={`w-9 h-9 rounded-lg bg-${card.color}-500/20 flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{card.value}</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Members table */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Loop 2000 – Member Records ({members.length})</h3>
          </div>
          {members.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <UserMinus className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No INS member segments found in this 834 file.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Member ID</th>
                    <th className="p-4">Last Name</th>
                    <th className="p-4">First Name</th>
                    <th className="p-4 text-center">Type</th>
                    <th className="p-4">Relationship</th>
                    <th className="p-4 text-center">Gender</th>
                    <th className="p-4">Birth Date</th>
                    <th className="p-4">Effective</th>
                    <th className="p-4">Term Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {members.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">{m.memberId || "—"}</td>
                      <td className="p-4 text-sm text-slate-900 dark:text-slate-100 font-medium">{m.lastName || "—"}</td>
                      <td className="p-4 text-sm text-slate-900 dark:text-slate-100">{m.firstName || "—"}</td>
                      <td className="p-4 text-center">
                        {m.subscriberIndicator === "Y" ? (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold rounded border border-green-300 dark:border-green-800">Subscriber</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-[10px] font-bold rounded border border-purple-300 dark:border-purple-800">Dependent</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{RELATIONSHIP_LABEL[m.relationship] || m.relationship || "—"}</td>
                      <td className="p-4 text-center"><GenderBadge gender={m.gender} /></td>
                      <td className="p-4 font-mono text-xs text-slate-600 dark:text-slate-400">{m.birthDate || "—"}</td>
                      <td className="p-4 font-mono text-xs text-green-600 dark:text-green-400">{m.effectiveDate || "—"}</td>
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">{m.termDate || "Active"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
