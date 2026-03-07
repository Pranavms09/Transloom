// Types
export interface Segment {
  id: number;
  source: string;
  target: string;
  status: string;
  matchType: string;
  validationIssues: any[];
}

export interface Project {
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

export interface TMEntry {
  id: string;
  source: string;
  target: string;
  projectRef: string;
  dateAdded: string;
}

export interface GlossaryEntry {
  source: string;
  target: string;
}

export const fetchProjects = (): Project[] =>
  JSON.parse(localStorage.getItem("transloom_projects") || "[]");
export const saveProjects = (ds: Project[]) =>
  localStorage.setItem("transloom_projects", JSON.stringify(ds));

export const fetchTM = (): TMEntry[] =>
  JSON.parse(localStorage.getItem("transloom_tm") || "[]");
export const saveTM = (ds: TMEntry[]) =>
  localStorage.setItem("transloom_tm", JSON.stringify(ds));

export const fetchGlossary = (): GlossaryEntry[] =>
  JSON.parse(localStorage.getItem("transloom_glossary") || "[]");
export const saveGlossary = (ds: GlossaryEntry[]) =>
  localStorage.setItem("transloom_glossary", JSON.stringify(ds));

export const fetchProfiles = () =>
  JSON.parse(localStorage.getItem("transloom_profiles") || "[]");
export const saveProfiles = (ds: any) =>
  localStorage.setItem("transloom_profiles", JSON.stringify(ds));

export function calculateSimilarity(sourceText: string) {
  const tm = fetchTM();
  if (tm.length === 0) return { type: "None", text: null, matchRate: 0 };

  let bestMatch = { type: "None", text: null as string | null, matchRate: 0 };

  tm.forEach((entry) => {
    if (entry.source.toLowerCase() === sourceText.toLowerCase()) {
      bestMatch = { type: "Exact", text: entry.target, matchRate: 100 };
    } else {
      const lenDiff = Math.abs(entry.source.length - sourceText.length);
      if (lenDiff < sourceText.length * 0.2 && bestMatch.matchRate < 80) {
        bestMatch = { type: "Fuzzy", text: entry.target, matchRate: 85 };
      }
    }
  });
  return bestMatch;
}

export function applyGlossary(text: string) {
  const glossary = fetchGlossary();
  let updatedText = text;
  glossary.forEach((term) => {
    const regex = new RegExp(`\\b${term.source}\\b`, "gi");
    updatedText = updatedText.replace(
      regex,
      `<span class="bg-yellow-500/20 text-yellow-400 px-1 border-b border-yellow-500 border-dashed cursor-help" title="Glossary term applied">${term.target}</span>`,
    );
  });
  return updatedText;
}

export function applyStyleProfile(targetLanguage: string, styleId: string) {
  const profiles = fetchProfiles();
  const profile = profiles.find((p: any) => p.id === styleId);

  const genericTargets: Record<string, string> = {
    es: "Esta es una traducción simulada autogenerada por Transloom PS2.",
    fr: "Ceci est une traduction simulée par TransLoom MVP.",
    de: "Dies ist eine simulierte Übersetzung, die von Transloom TM generiert wurde.",
    ja: "これはTransloomP S2によって自動生成された模擬翻訳です。",
  };

  let baseText =
    genericTargets[targetLanguage] || "Translated string representation mock.";

  if (styleId === "formal" || (profile && profile.tone === "Formal")) {
    baseText += " (Cordially applied terminology).";
  } else if (styleId === "conversational") {
    baseText += " (Hope you like it! 😊).";
  }

  return baseText;
}

export function validateSegment(text: string) {
  const issues = [];
  if (/\s{2,}/.test(text)) {
    issues.push({
      type: "Double Space",
      severity: "Low",
      message: "Contains consecutive spaces.",
    });
  }
  if (text.length > 0 && !/[.!?]$/.test(text)) {
    issues.push({
      type: "Missing Punctuation",
      severity: "Medium",
      message: "Segment doesn't end with a punctuation mark.",
    });
  }
  if (text.length > 0 && text[0] !== text[0].toUpperCase()) {
    issues.push({
      type: "Capitalization",
      severity: "High",
      message: "Does not start with a capital letter.",
    });
  }
  return issues;
}

export function updateTranslationMemory(
  source: string,
  target: string,
  projectId: string,
) {
  const tm = fetchTM();
  tm.push({
    id: Date.now().toString(),
    source: source,
    target: target,
    projectRef: projectId,
    dateAdded: new Date().toISOString(),
  });
  saveTM(tm);
}
