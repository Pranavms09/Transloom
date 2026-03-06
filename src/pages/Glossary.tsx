import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { BookA, BookDashed, ArrowRight, Trash } from "lucide-react";

export interface GlossaryEntry {
  id: string;
  source: string;
  target: string;
  pair?: string;
  notes?: string;
}

export const fetchGlossary = (): GlossaryEntry[] =>
  JSON.parse(localStorage.getItem("transloom_glossary") || "[]");
export const saveGlossary = (ds: GlossaryEntry[]) =>
  localStorage.setItem("transloom_glossary", JSON.stringify(ds));

export function Glossary() {
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);

  // Form State
  const [sourceTerm, setSourceTerm] = useState("");
  const [targetTerm, setTargetTerm] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setGlossary(fetchGlossary());
  }, []);

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    const newTerm: GlossaryEntry = {
      id: Date.now().toString(),
      source: sourceTerm.trim(),
      target: targetTerm.trim(),
      pair: pairCode.trim() || "Global",
      notes: notes.trim(),
    };
    const updated = [...glossary, newTerm];
    saveGlossary(updated);
    setGlossary(updated);

    // Reset
    setSourceTerm("");
    setTargetTerm("");
    setPairCode("");
    setNotes("");
  };

  const handleDelete = (id: string) => {
    const updated = glossary.filter((g) => g.id !== id);
    saveGlossary(updated);
    setGlossary(updated);
  };

  return (
    <Layout title="Subject Glossary" icon={<BookA className="w-5 h-5" />}>
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ADD TERM FORM */}
          <div className="lg:col-span-1 border border-border bg-card p-6 rounded-xl shadow-sm h-fit sticky top-0">
            <h2 className="text-lg font-bold mb-4">Add New Term</h2>
            <form onSubmit={handleAddTerm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Source Term
                </label>
                <input
                  type="text"
                  required
                  value={sourceTerm}
                  onChange={(e) => setSourceTerm(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Term
                </label>
                <input
                  type="text"
                  required
                  value={targetTerm}
                  onChange={(e) => setTargetTerm(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Language Pair Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. EN-ES"
                  value={pairCode}
                  onChange={(e) => setPairCode(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Context Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-500 transition"
              >
                Save Term
              </button>
            </form>
          </div>

          {/* TERMS DIRECTORY */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Terminology Rules
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                These forced strings bypass generated TM limits overriding the
                LLM translation text automatically.
              </p>
            </div>

            <div className="space-y-3">
              {glossary.length === 0 ? (
                <div className="py-12 text-center text-gray-500 border border-border border-dashed rounded-xl">
                  <BookDashed className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No glossary terms configured.</p>
                </div>
              ) : (
                glossary.map((g) => (
                  <div
                    key={g.id}
                    className="bg-card border border-border p-5 rounded-xl shadow-sm flex items-start justify-between group transition hover:border-gray-600"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg leading-none">
                          {g.source}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <h3 className="font-bold text-lg text-yellow-500 leading-none">
                          {g.target}
                        </h3>
                      </div>
                      {g.notes && (
                        <p className="text-sm text-gray-400 mb-2 italic">
                          “{g.notes}”
                        </p>
                      )}
                      <span className="text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-400 px-2 py-1 rounded capitalize">
                        {g.pair || "GLOBAL"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-gray-600 hover:text-red-400 transition"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
