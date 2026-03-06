import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import {
  FolderOpen,
  Plus,
  Globe2,
  FileText,
  Paintbrush as PaintIcon,
  X,
  Folder,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Types
interface Segment {
  id: number;
  source: string;
  target: string;
  status: string;
  matchType: string;
  validationIssues: any[];
}

interface Project {
  id: string;
  name: string;
  source: string;
  target: string;
  style: string;
  status: string;
  wordCount: number;
  progress: number;
  segments: Segment[];
  dateCreated: string;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Form State
  const [projName, setProjName] = useState("");
  const [projSource, setProjSource] = useState("en");
  const [projTarget, setProjTarget] = useState("es");
  const [projStyle, setProjStyle] = useState("formal");
  const [projDocText, setProjDocText] = useState("");

  useEffect(() => {
    const loadedProjects = JSON.parse(
      localStorage.getItem("transloom_projects") || "[]",
    );
    setProjects(loadedProjects);

    const params = new URLSearchParams(location.search);
    if (params.get("new") === "true") {
      setIsModalOpen(true);
    }
  }, [location]);

  const saveProjects = (newProjects: Project[]) => {
    localStorage.setItem("transloom_projects", JSON.stringify(newProjects));
    setProjects(newProjects);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    const sentences = projDocText.match(/[^.!?]+[.!?]+/g) || [projDocText];
    const segments = sentences
      .map((s, i) => ({
        id: i,
        source: s.trim(),
        target: "",
        status: "Draft",
        matchType: "None",
        validationIssues: [],
      }))
      .filter((s) => s.source.length > 0);

    const newProject: Project = {
      id: Date.now().toString(),
      name: projName,
      source: projSource,
      target: projTarget,
      style: projStyle,
      status: "In Progress",
      wordCount: projDocText.split(/\s+/).length,
      progress: 0,
      segments: segments,
      dateCreated: new Date().toISOString(),
    };

    saveProjects([newProject, ...projects]);
    setIsModalOpen(false);

    // Reset form
    setProjName("");
    setProjSource("en");
    setProjTarget("es");
    setProjStyle("formal");
    setProjDocText("");
  };

  return (
    <Layout title="Directory" icon={<FolderOpen className="w-5 h-5" />}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Active Projects
            </h2>
            <p className="text-gray-400 text-sm">
              Review documents currently in translation workflows.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-500 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No projects found. Create a new one to begin translating.</p>
            </div>
          ) : (
            projects.map((p) => {
              let statusColor = "text-yellow-500 bg-yellow-500/20";
              if (p.status === "Completed")
                statusColor = "text-green-500 bg-green-500/20";
              if (p.status === "In Review")
                statusColor = "text-blue-500 bg-blue-500/20";

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/workspace?id=${p.id}`)}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-gray-600 transition flex flex-col cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg truncate pr-4">
                      {p.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-6 flex-1 space-y-2">
                    <p className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4" /> {p.source.toUpperCase()} →{" "}
                      {p.target.toUpperCase()}
                    </p>
                    <p className="flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {p.wordCount} words (
                      {p.segments.length} segments)
                    </p>
                    <p className="flex items-center gap-2">
                      <PaintIcon className="w-4 h-4" /> Profile: {p.style}
                    </p>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right text-gray-500">
                    {p.progress}% completed
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl mx-4 p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">
              Create New Translation Project
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal Contract 2026"
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Source Language
                  </label>
                  <select
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={projSource}
                    onChange={(e) => setProjSource(e.target.value)}
                  >
                    <option value="en">English (EN)</option>
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                    <option value="de">German (DE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Target Language
                  </label>
                  <select
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={projTarget}
                    onChange={(e) => setProjTarget(e.target.value)}
                  >
                    <option value="es">Spanish (ES)</option>
                    <option value="fr">French (FR)</option>
                    <option value="de">German (DE)</option>
                    <option value="ja">Japanese (JA)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Style Profile
                </label>
                <select
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={projStyle}
                  onChange={(e) => setProjStyle(e.target.value)}
                >
                  <option value="formal">Formal & Technical</option>
                  <option value="conversational">Conversational</option>
                  <option value="medical">Medical Regulated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Upload Document (.txt, .docx mock)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste the source text here. We will simulate document upload by splitting this text into sentences..."
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                  value={projDocText}
                  onChange={(e) => setProjDocText(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-500 transition mt-2"
              >
                Create Project & Split Segments
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
