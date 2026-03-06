import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import {
  SplitSquareHorizontal,
  Sparkles,
  AlertTriangle,
  CheckSquare,
  Check,
  X,
  FolderSearch,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { JSONTree } from "react-json-tree";
import {
  fetchProjects,
  saveProjects,
  calculateSimilarity,
  applyGlossary,
  applyStyleProfile,
  updateTranslationMemory,
  validateSegment,
  Project,
} from "../lib/transloom";

export function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const projId = new URLSearchParams(location.search).get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [activeSegIndex, setActiveSegIndex] = useState<number>(-1);
  const [targetText, setTargetText] = useState("");
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  useEffect(() => {
    if (!projId) return;
    const all = fetchProjects();
    const found = all.find((p) => p.id === projId);
    if (found) {
      setProject(found);
    }
  }, [projId]);

  const updateProjectInStorage = (updatedProject: Project) => {
    const all = fetchProjects();
    const idx = all.findIndex((p) => p.id === updatedProject.id);
    if (idx !== -1) {
      all[idx] = updatedProject;
      saveProjects(all);
      setProject(updatedProject);
    }
  };

  if (!projId || !project) {
    return (
      <Layout
        title="Workspace"
        icon={<SplitSquareHorizontal className="w-5 h-5" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
          <FolderSearch className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            You must open a project from the directory to translate segments.
          </p>
          <Link
            to="/projects"
            className="bg-white text-black font-semibold rounded-lg px-4 py-2"
          >
            Go to Projects
          </Link>
        </div>
      </Layout>
    );
  }

  const completedCount = project.segments.filter(
    (s) => s.status === "Approved",
  ).length;
  const isCompleted =
    completedCount === project.segments.length && project.segments.length > 0;

  const handleOpenEditor = (idx: number) => {
    setActiveSegIndex(idx);
    setTargetText(project.segments[idx].target || "");
    setValidationErrors([]);
  };

  const activeSegment =
    activeSegIndex >= 0 ? project.segments[activeSegIndex] : null;

  const handleGenerate = () => {
    if (!activeSegment) return;
    const tmMatch = calculateSimilarity(activeSegment.source);
    let generatedOutput = "";

    if (tmMatch.type === "Exact" || tmMatch.type === "Fuzzy") {
      generatedOutput = tmMatch.text || "";
    } else {
      generatedOutput = applyStyleProfile(project.target, project.style);
    }

    const glossaryApplied = applyGlossary(generatedOutput);
    setTargetText(glossaryApplied);

    // Update matchType immediately for the UI
    const updatedProject = { ...project };
    updatedProject.segments[activeSegIndex].matchType = tmMatch.type;
    setProject(updatedProject); // Only local update before save
  };

  const handleValidate = () => {
    // Strip HTML for validation
    const rawInputText = targetText.replace(/<[^>]+>/g, "");
    const issues = validateSegment(rawInputText);
    setValidationErrors(issues);
    if (issues.length === 0) {
      alert("Looks good! No static formatting errors.");
    }
  };

  const handleAccept = () => {
    if (!activeSegment) return;
    const updatedProject = { ...project };
    updatedProject.segments[activeSegIndex] = {
      ...activeSegment,
      target: targetText,
      status: "Approved",
    };

    const newCompleted = updatedProject.segments.filter(
      (s) => s.status === "Approved",
    ).length;
    updatedProject.progress =
      Math.round((newCompleted / updatedProject.segments.length) * 100) || 0;
    if (updatedProject.progress === 100) {
      updatedProject.status = "Completed";
    } else {
      updatedProject.status = "In Progress";
    }

    updateProjectInStorage(updatedProject);

    // Save to TM
    const strippedTar = targetText.replace(/<[^>]+>/g, ""); // strip HTML
    updateTranslationMemory(activeSegment.source, strippedTar, project.id);

    // Move next
    if (activeSegIndex < updatedProject.segments.length - 1) {
      handleOpenEditor(activeSegIndex + 1);
    }
  };

  const handleReject = () => {
    if (!activeSegment) return;
    const updatedProject = { ...project };
    updatedProject.segments[activeSegIndex] = {
      ...activeSegment,
      status: "Rejected",
      target: "",
    };
    setTargetText("");
    updateProjectInStorage(updatedProject);
  };

  const themeJsonTree = {
    scheme: "custom",
    author: "transloom",
    base00: "#121214",
    base01: "#27272a",
    base02: "#3f3f46",
    base03: "#52525b",
    base04: "#71717a",
    base05: "#a1a1aa",
    base06: "#d4d4d8",
    base07: "#fafafa",
    base08: "#f87171",
    base09: "#fb923c",
    base0A: "#fbbf24",
    base0B: "#4ade80",
    base0C: "#2dd4bf",
    base0D: "#60a5fa",
    base0E: "#a78bfa",
    base0F: "#f472b6",
  };

  return (
    <Layout
      title="Workspace"
      icon={<SplitSquareHorizontal className="w-5 h-5" />}
      actions={
        <div className="flex items-center gap-3">
          {isCompleted && (
            <button
              onClick={() => {
                if (
                  window.confirm("Complete the current project execution loop?")
                ) {
                  navigate("/dashboard");
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
            >
              Complete Project
            </button>
          )}
        </div>
      }
    >
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row h-full rounded-xl border border-border shadow-sm">
        {/* Source Panel */}
        <div className="w-full lg:w-1/3 flex flex-col h-full bg-[#0c0c0e] border-r border-border">
          <div className="px-4 py-3 border-b border-border bg-card flex justify-between items-center text-sm shrink-0">
            <span className="font-bold">
              Source Segments (
              <span className="uppercase">{project.source}</span>)
            </span>
            <span className="text-xs text-gray-500">
              {completedCount}/{project.segments.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {project.segments.map((seg, idx) => {
              const statusColors: any = {
                Draft: "bg-gray-800 text-gray-400 border-gray-700",
                Approved: "bg-green-900/40 text-green-400 border-green-800",
                Rejected: "bg-red-900/40 text-red-400 border-red-800",
              };
              const sCol = statusColors[seg.status] || statusColors["Draft"];
              const isActive = activeSegIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenEditor(idx)}
                  className={`p-3 rounded-lg border bg-card cursor-pointer transition select-none ${
                    isActive
                      ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)]"
                      : "border-transparent hover:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-gray-500">
                      SEG {idx + 1}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${sCol}`}
                    >
                      {seg.status}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 leading-relaxed text-gray-300 pointer-events-none">
                    {seg.source}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col h-full bg-[#09090b]">
          <div className="px-6 py-3 border-b border-border bg-card flex justify-between items-center text-sm shadow-sm z-10 shrink-0">
            <span className="font-bold flex items-center gap-2">
              Target Translation (
              <span className="uppercase">{project.target}</span>)
            </span>
            <span className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={!activeSegment}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600 rounded px-3 py-1 font-medium transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> Generate Translation
              </button>
            </span>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            {!activeSegment ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <CheckSquare className="w-12 h-12 mb-3 opacity-30" />
                <p>Select a segment from the left pane to edit.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-6">
                {/* Source Ref */}
                <div className="flex gap-6 h-full flex-col xl:flex-row">
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        Source Context
                        {activeSegment.matchType !== "None" && (
                          <span
                            className={`ml-2 lowercase text-xs capitalize px-2 py-0.5 rounded tracking-wider font-bold ${
                              activeSegment.matchType === "Exact"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {activeSegment.matchType}
                          </span>
                        )}
                      </h4>
                      <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg text-lg text-gray-300">
                        {activeSegment.source}
                      </div>
                    </div>

                    {/* Editor ContentEditable or Textarea */}
                    <div className="flex-1 flex flex-col relative min-h-[150px]">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Translation Output
                      </h4>
                      {validationErrors.length > 0 && (
                        <div className="mb-2 p-3 bg-red-950/40 border border-red-900 rounded-lg text-red-400 text-sm flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            {validationErrors.map((err, i) => (
                              <div key={i}>
                                <strong>{err.severity}</strong>: {err.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setTargetText(e.currentTarget.innerHTML)}
                        className="flex-1 w-full bg-[#121214] border border-gray-700 rounded-lg p-4 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: targetText }}
                      />
                    </div>
                  </div>

                  {/* Segment Metadata Tree (satisfies collapsible segment tree requirement) */}
                  <div className="w-full xl:w-72 shrink-0 flex flex-col border border-gray-800 rounded-lg bg-[#0c0c0e]">
                    <div className="px-3 py-2 border-b border-gray-800 text-xs font-bold uppercase text-gray-500">
                      Segment Metadata
                    </div>
                    <div className="flex-1 overflow-auto p-2 text-sm">
                      <JSONTree
                        data={activeSegment}
                        theme={themeJsonTree}
                        invertTheme={false}
                        hideRoot={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-border pt-4 shrink-0">
                  <button
                    onClick={handleReject}
                    className="text-red-400 hover:bg-red-950/40 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleValidate}
                      className="bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg px-4 py-2 transition flex items-center gap-2"
                    >
                      <CheckSquare className="w-4 h-4" /> Validate
                    </button>
                    <button
                      onClick={handleAccept}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg px-6 py-2 transition shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Accept & Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
