import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { FileJson, ListTree, ChevronRight, ChevronDown, Upload, Info } from "lucide-react";
import { JSONTree } from "react-json-tree";
import { useEDI } from "../contexts/EDIContext";
import { X12Loop, X12Segment } from "../lib/x12Parser";
import { useNavigate } from "react-router-dom";

const jsonTheme = {
  scheme: "claimlens",
  author: "claimlens",
  base00: "transparent",
  base01: "#1e293b", base02: "#334155", base03: "#475569",
  base04: "#64748b", base05: "#94a3b8", base06: "#cbd5e1", base07: "#f1f5f9",
  base08: "#f87171", base09: "#fb923c", base0A: "#fbbf24", base0B: "#4ade80",
  base0C: "#2dd4bf", base0D: "#60a5fa", base0E: "#a78bfa", base0F: "#f472b6",
};

// Collapsible Loop Node
function LoopNode({ loop, depth = 0 }: { loop: X12Loop; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);

  const hasChildren = loop.children.length > 0 || loop.segments.length > 0;
  const indent = depth * 16;

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : indent }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 group transition"
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5 h-3.5 flex-shrink-0" />
        )}
        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          {loop.loopId}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{loop.name}</span>
        <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          {loop.segments.length}s / {loop.children.length}c
        </span>
      </button>

      {open && (
        <div className="ml-4 border-l border-gray-200 dark:border-slate-700 pl-3 space-y-0.5 mt-0.5">
          {/* Direct segments */}
          {loop.segments.map((seg, i) => (
            <SegmentRow key={i} seg={seg} />
          ))}
          {/* Child loops */}
          {loop.children.map((child, i) => (
            <LoopNode key={i} loop={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function SegmentRow({ seg }: { seg: X12Segment }) {
  const [expanded, setExpanded] = useState(false);
  const elements = seg.elements.slice(1); // skip segment ID

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
      >
        {elements.length > 0 ? (
          expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
        ) : <span className="w-3 h-3" />}
        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 w-12 flex-shrink-0">{seg.id}</span>
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
          {elements.filter(Boolean).slice(0, 4).join(" · ")}
          {elements.length > 4 && " ..."}
        </span>
        <span className="ml-auto text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100">
          [{seg.index}]
        </span>
      </button>

      {expanded && (
        <div className="ml-6 mb-2 space-y-0.5">
          {elements.map((el, i) => (
            <div key={i} className="flex items-baseline gap-3 py-0.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
              <span className="font-mono text-[10px] text-slate-400 w-16 flex-shrink-0">
                {seg.id}{String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-xs text-slate-700 dark:text-slate-200 break-all">
                {el || <span className="italic text-slate-400">(empty)</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer() {
  const [activeTab, setActiveTab] = useState<"tree" | "json" | "raw">("tree");
  const { parsedFile, selectedSegmentIndex } = useEDI();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSegmentIndex !== null) {
      setActiveTab("raw");
      setTimeout(() => {
        const el = document.getElementById(`raw-seg-${selectedSegmentIndex}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [selectedSegmentIndex]);

  if (!parsedFile) {
    return (
      <Layout title="File Explorer" icon={<FileJson className="w-5 h-5 text-blue-500" />}>
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center">
          <ListTree className="w-20 h-20 text-slate-300 dark:text-slate-700 mb-5" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No File Loaded</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Upload an EDI file to explore its parsed structure.</p>
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Upload className="w-4 h-4" /> Upload EDI File
          </button>
        </div>
      </Layout>
    );
  }

  const loopTreeAsJson = (loops: X12Loop[]): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const loop of loops) {
      const segments: Record<string, unknown> = {};
      for (const seg of loop.segments) {
        segments[`${seg.id}[${seg.index}]`] = seg.elements.slice(1).reduce<Record<string, string>>(
          (acc, el, i) => { acc[`${seg.id}${String(i + 1).padStart(2, "0")}`] = el; return acc; }, {}
        );
      }
      result[`${loop.loopId} – ${loop.name}`] = {
        ...segments,
        ...(loop.children.length > 0 ? loopTreeAsJson(loop.children) : {}),
      };
    }
    return result;
  };

  return (
    <Layout title="File Explorer" icon={<FileJson className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-7xl mx-auto w-full flex flex-col" style={{ height: "calc(100vh - 11rem)" }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Parsed Structure Viewer</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              <span className="font-mono text-blue-600 dark:text-blue-400">{parsedFile.fileInfo.name}</span>
              {" · "}{parsedFile.fileInfo.type}
              {" · "}{parsedFile.fileInfo.segmentCount} segments
            </p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
            {(["tree", "json", "raw"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md font-medium text-sm capitalize transition ${
                  activeTab === tab ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {tab === "tree" ? "Visual Tree" : tab === "json" ? "Raw JSON" : "Raw EDI"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          {activeTab === "tree" && (
            <div className="h-full overflow-y-auto p-6 space-y-1">
              {parsedFile.loopTree.map((loop, i) => (
                <LoopNode key={i} loop={loop} depth={0} />
              ))}
            </div>
          )}

          {activeTab === "json" && (
            <div className="h-full overflow-y-auto p-6 bg-slate-900 dark:bg-slate-950">
              <JSONTree
                data={loopTreeAsJson(parsedFile.loopTree)}
                theme={jsonTheme}
                invertTheme={false}
                hideRoot
                shouldExpandNodeInitially={(_, __, level) => level < 2}
              />
            </div>
          )}

          {activeTab === "raw" && (
            <div className="h-full overflow-auto p-6 bg-slate-900 dark:bg-slate-950">
              <div className="flex items-start gap-3 mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">Showing first 4,000 characters of raw EDI content with ~ as segment terminator.</p>
              </div>
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap break-all leading-relaxed">
                {parsedFile.rawSegments.map((seg) => (
                  <span 
                    key={seg.index} 
                    id={`raw-seg-${seg.index}`}
                    className={selectedSegmentIndex === seg.index ? "bg-purple-900/40 border border-purple-500/30 rounded px-1 block w-full outline outline-1 outline-purple-500/50" : ""}
                  >
                    <span className="text-teal-400 font-bold">{seg.id}</span>
                    {seg.elements.length > 1 ? "*" + seg.elements.slice(1).join("*") : ""}
                    <span className="text-yellow-400">~</span>
                    {"\n"}
                  </span>
                ))}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
