// transloom.js - Core Shared Logic Module

// ---------------------------------------
// 1. DATA FETCHERS
// ---------------------------------------
export const fetchProjects = () =>
  JSON.parse(localStorage.getItem("transloom_projects") || "[]");
export const saveProjects = (ds) =>
  localStorage.setItem("transloom_projects", JSON.stringify(ds));

export const fetchTM = () =>
  JSON.parse(localStorage.getItem("transloom_tm") || "[]");
export const saveTM = (ds) =>
  localStorage.setItem("transloom_tm", JSON.stringify(ds));

export const fetchGlossary = () =>
  JSON.parse(localStorage.getItem("transloom_glossary") || "[]");
export const saveGlossary = (ds) =>
  localStorage.setItem("transloom_glossary", JSON.stringify(ds));

export const fetchProfiles = () =>
  JSON.parse(localStorage.getItem("transloom_profiles") || "[]");
export const saveProfiles = (ds) =>
  localStorage.setItem("transloom_profiles", JSON.stringify(ds));

// ---------------------------------------
// 2. CORE TRANSLATION LOGIC
// ---------------------------------------

export function calculateSimilarity(sourceText) {
  const tm = fetchTM();
  if (tm.length === 0) return { type: "None", text: null, matchRate: 0 };

  let bestMatch = { type: "None", text: null, matchRate: 0 };

  // Levenshtein distance simplified mock check
  tm.forEach((entry) => {
    if (entry.source.toLowerCase() === sourceText.toLowerCase()) {
      bestMatch = { type: "Exact", text: entry.target, matchRate: 100 };
    } else {
      // Very simple Mock fuzzy match logic (length variance)
      const lenDiff = Math.abs(entry.source.length - sourceText.length);
      if (lenDiff < sourceText.length * 0.2 && bestMatch.matchRate < 80) {
        // arbitrary 20% length closeness
        // Simulating a fuzzy metric
        bestMatch = { type: "Fuzzy", text: entry.target, matchRate: 85 };
      }
    }
  });
  return bestMatch;
}

export function applyGlossary(text) {
  const glossary = fetchGlossary();
  let updatedText = text;
  // Iterate glossary over text ensuring terminology match
  glossary.forEach((term) => {
    // Case insensitive global replacement
    const regex = new RegExp(`\\b${term.source}\\b`, "gi");
    updatedText = updatedText.replace(
      regex,
      `<span class="bg-yellow-500/20 text-yellow-400 px-1 border-b border-yellow-500 border-dashed cursor-help" title="Glossary term applied">${term.target}</span>`,
    );
  });
  return updatedText;
}

export function applyStyleProfile(targetLanguage, styleId) {
  // Determine tone based on mock profiles
  const profiles = fetchProfiles();
  const profile = profiles.find((p) => p.id === styleId);

  // In MVP simulate translation output mock variations
  const genericTargets = {
    es: "Esta es una traducción simulada autogenerada por Transloom PS2.",
    fr: "Ceci est une traduction simulée par TransLoom MVP.",
    de: "Dies ist eine simulierte Übersetzung, die von Transloom TM generiert wurde.",
    ja: "これはTransloomP S2によって自動生成された模擬翻訳です。",
  };

  let baseText =
    genericTargets[targetLanguage] || "Translated string representation mock.";

  // Append tone markers
  if (styleId === "formal" || (profile && profile.tone === "Formal")) {
    baseText += " (Cordially applied terminology).";
  } else if (styleId === "conversational") {
    baseText += " (Hope you like it! 😊).";
  }

  return baseText;
}

// Validation logic checking mock formatting standard errors
export function validateSegment(text) {
  const issues = [];
  if (/\s{2,}/.test(text)) {
    issues.push({
      type: "Double Space",
      severity: "Low",
      message: "Contains consecutive spaces.",
    });
  }
  // Missing punctuation ending
  if (text.length > 0 && !/[.!?]$/.test(text)) {
    issues.push({
      type: "Missing Punctuation",
      severity: "Medium",
      message: "Segment doesn't end with a punctuation mark.",
    });
  }
  // Simple cap check
  if (text.length > 0 && text[0] !== text[0].toUpperCase()) {
    issues.push({
      type: "Capitalization",
      severity: "High",
      message: "Does not start with a capital letter.",
    });
  }
  return issues;
}

export function updateTranslationMemory(source, target, projectId) {
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

// Analytics dynamically compute based on DB items
export function calculateAnalytics() {
  const projects = fetchProjects();
  const tm = fetchTM();

  let totalSegments = 0;
  let approvedSegments = 0;

  let exactMatches = 0;
  let fuzzyMatches = 0;

  projects.forEach((p) => {
    p.segments.forEach((seg) => {
      totalSegments++;
      if (seg.status === "Approved") approvedSegments++;
      if (seg.matchType === "Exact") exactMatches++;
      if (seg.matchType === "Fuzzy") fuzzyMatches++;
    });
  });

  const newSegments = totalSegments - exactMatches - fuzzyMatches;
  const reuseRate =
    totalSegments > 0
      ? (((exactMatches + fuzzyMatches) / totalSegments) * 100).toFixed(1)
      : 0;

  return {
    totalSegments,
    approvedSegments,
    newSegments,
    exactMatches,
    fuzzyMatches,
    reuseRate: parseFloat(reuseRate),
    tmSize: tm.length,
  };
}
