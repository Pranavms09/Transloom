import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { CheckSquare, CheckCircle2 } from "lucide-react";
import { fetchProjects, Project } from "../lib/transloom";
import { useNavigate } from "react-router-dom";

interface ReviewItem {
  projectId: string;
  projectName: string;
  source: string;
}

export function Review() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const projects = fetchProjects();
    const items: ReviewItem[] = [];

    projects.forEach((proj: Project) => {
      proj.segments.forEach((seg) => {
        if (seg.status === "Rejected") {
          items.push({
            projectId: proj.id,
            projectName: proj.name,
            source: seg.source,
          });
        }
      });
    });

    setQueue(items);
  }, []);

  return (
    <Layout
      title="Post-Edit Review Queue"
      icon={<CheckSquare className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-8 border-b border-border pb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Pending Quality Assurance
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Segments marked as 'Rejected' or needing human supervision before
              TM commitment.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-900 border-b border-border text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-1/12">Status</th>
                <th className="p-4 w-4/12">Source Segment</th>
                <th className="p-4 w-4/12">Target Segment</th>
                <th className="p-4 w-2/12">Project</th>
                <th className="p-4 w-1/12 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {queue.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-900/50 transition relative group"
                >
                  <td className="p-4 align-top">
                    <span className="px-2 py-1 text-[10px] uppercase font-bold rounded bg-red-900/40 text-red-500 border border-red-800">
                      Rejected
                    </span>
                  </td>
                  <td className="p-4 align-top text-sm text-gray-300">
                    <div className="line-clamp-3">{item.source}</div>
                  </td>
                  <td className="p-4 align-top text-sm text-gray-400 italic">
                    Needs modification or AI re-generation.
                  </td>
                  <td className="p-4 align-top text-sm text-gray-400 whitespace-nowrap">
                    {item.projectName}
                  </td>
                  <td className="p-4 align-top text-right">
                    <button
                      onClick={() =>
                        navigate(`/workspace?id=${item.projectId}`)
                      }
                      className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded transition font-medium whitespace-nowrap"
                    >
                      Open Editor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {queue.length === 0 && (
            <div className="py-12 text-center text-gray-500 bg-card">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
              <p className="text-lg">Queue is Empty</p>
              <p className="text-sm mt-1">
                All segments currently meet QA guidelines or are pending initial
                translation.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
