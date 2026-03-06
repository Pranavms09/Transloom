import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Database, Search, Download, Trash2 } from "lucide-react";
import { fetchTM, saveTM, TMEntry } from "../lib/transloom";

export function Memory() {
  const [memories, setMemories] = useState<TMEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMemories(fetchTM());
  }, []);

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Delete this Translation Memory instance permanently? Re-translating exact matches will no longer surface via exact-match logic.",
      )
    ) {
      const updated = memories.filter((m) => m.id !== id);
      saveTM(updated);
      setMemories(updated);
    }
  };

  const handleExport = () => {
    if (memories.length === 0) {
      alert("Nothing to export.");
      return;
    }
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(memories, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", "transloom_TM_export.json");
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const filteredMemories = memories
    .filter(
      (m) =>
        m.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.target.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    );

  return (
    <Layout title="Translation Memory" icon={<Database className="w-5 h-5" />}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Enterprise TM Corpus
            </h2>
            <p className="text-gray-400 text-sm">
              Review, delete, and export saved translation segments dynamically
              leveraged by the Engine.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search source or target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition shadow-sm"
              />
            </div>
            <button
              onClick={handleExport}
              className="bg-gray-800 border border-gray-700 text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-700 transition flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>

        {/* TM Data Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900 border-b border-border">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-5/12">
                  Source Segment
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-5/12">
                  Target Translation
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/12">
                  Added
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/12 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMemories.map((m) => {
                const dateObj = new Date(m.dateAdded);
                const validDate = isNaN(dateObj.getTime())
                  ? "Unknown"
                  : dateObj.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-900/50 transition relative group"
                  >
                    <td className="p-4 align-top">
                      <p className="text-sm font-medium text-gray-200 line-clamp-3">
                        {m.source}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono">
                        ID: {m.id.substring(0, 8)} | PROJ:{" "}
                        {m.projectRef ? m.projectRef.substring(0, 6) : "N/A"}
                      </p>
                    </td>
                    <td className="p-4 align-top border-l border-border/50">
                      <p className="text-sm text-gray-300 line-clamp-3">
                        {m.target}
                      </p>
                    </td>
                    <td className="p-4 align-top text-xs text-gray-400 whitespace-nowrap">
                      {validDate}
                    </td>
                    <td className="p-4 align-top text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-gray-500 hover:text-red-400 p-1 transition"
                        title="Delete Segment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMemories.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>
                {searchQuery
                  ? "No matching segments found."
                  : "The Translation Memory is empty."}
              </p>
              {!searchQuery && (
                <p className="text-sm mt-1">
                  Approve segments in the Workspace to populate this list.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
