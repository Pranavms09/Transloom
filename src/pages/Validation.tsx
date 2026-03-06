import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import {
  ShieldAlert,
  ScanSearch,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
} from "lucide-react";
import { fetchProjects, validateSegment, Project } from "../lib/transloom";
import { useNavigate } from "react-router-dom";

interface ValidationIssue {
  projectId: string;
  projectName: string;
  segmentIndex: number;
  segmentTarget: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  message: string;
}

export function Validation() {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [metrics, setMetrics] = useState({ high: 0, medium: 0, low: 0 });
  const [hasScanned, setHasScanned] = useState(false);
  const navigate = useNavigate();

  const runScan = () => {
    const projects = fetchProjects();
    const newIssues: ValidationIssue[] = [];
    let cHigh = 0;
    let cMed = 0;
    let cLow = 0;

    projects.forEach((proj: Project) => {
      proj.segments.forEach((seg, sIdx) => {
        if (!seg.target) return; // Skip untranslated

        const rawTarget = seg.target.replace(/<[^>]*>?/gm, "");
        const findings = validateSegment(rawTarget);

        findings.forEach((i: any) => {
          if (i.severity === "High") cHigh++;
          if (i.severity === "Medium") cMed++;
          if (i.severity === "Low") cLow++;

          newIssues.push({
            projectId: proj.id,
            projectName: proj.name,
            segmentIndex: sIdx,
            segmentTarget: rawTarget,
            type: i.type,
            severity: i.severity as "High" | "Medium" | "Low",
            message: i.message,
          });
        });
      });
    });

    setIssues(newIssues);
    setMetrics({ high: cHigh, medium: cMed, low: cLow });
    setHasScanned(true);
  };

  useEffect(() => {
    // Auto run randomly delayed on load to simulate a scan
    const timer = setTimeout(() => {
      runScan();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout
      title="Validation Reports"
      icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 border-b border-border pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Source Quality Detection
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Aggregated list of common syntactic errors identified dynamically
              across active projects.
            </p>
          </div>
          <button
            onClick={runScan}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 transition flex items-center gap-2 text-sm"
          >
            <ScanSearch className="w-4 h-4" /> Run System Scan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
            <div className="bg-red-500/20 text-red-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.high}</h3>
              <p className="text-sm text-gray-500">High Severity</p>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
            <div className="bg-yellow-500/20 text-yellow-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.medium}</h3>
              <p className="text-sm text-gray-500">Medium Severity</p>
            </div>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
            <div className="bg-blue-500/20 text-blue-500 p-3 rounded-lg">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{metrics.low}</h3>
              <p className="text-sm text-gray-500">Low Severity</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-900 border-b border-border text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-1/12">Severity</th>
                <th className="p-4 w-2/12">Issue Type</th>
                <th className="p-4 w-6/12">Segment Content (Target)</th>
                <th className="p-4 w-2/12">Project</th>
                <th className="p-4 w-1/12 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {issues.map((i, idx) => {
                const sevStyle =
                  i.severity === "High"
                    ? "text-red-400 bg-red-900/40 border-red-800"
                    : i.severity === "Medium"
                      ? "text-yellow-400 bg-yellow-900/40 border-yellow-800"
                      : "text-blue-400 bg-blue-900/40 border-blue-800";

                return (
                  <tr key={idx} className="hover:bg-gray-900/50 transition">
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 border text-[10px] uppercase font-bold rounded ${sevStyle}`}
                      >
                        {i.severity}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-sm text-gray-300 whitespace-nowrap">
                      {i.type}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      <div className="line-clamp-2">{i.segmentTarget}</div>
                      <p className="text-[10px] mt-1 text-gray-600">
                        SEG {i.segmentIndex + 1}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-300 line-clamp-1">
                      {i.projectName}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/workspace?id=${i.projectId}`)}
                        className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition font-medium whitespace-nowrap"
                      >
                        Suggest Fix
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {hasScanned && issues.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20 text-green-500" />
              <p className="text-lg">Passed Static Analysis</p>
              <p className="text-sm mt-1">
                No severe warnings found inside active translated segments.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
