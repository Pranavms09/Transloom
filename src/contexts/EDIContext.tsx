// EDIContext.tsx
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  loadHistory as loadHistoryFromFirestore,
  addHistoryEntry as addToFirestore,
  removeHistoryEntry as removeFromFirestore,
  clearAllHistory as clearFirestoreHistory,
} from "../lib/historyService";

export interface AIAnalysisResult {
  fileType: string;
  fileInformation?: {
    transactionId?: string;
    senderId?: string;
    receiverId?: string;
    interchangeControlNumber?: string;
    functionalGroupControlNumber?: string;
    transactionSetControlNumber?: string;
  };
  transactionOverview?: {
    transactionType?: string;
    purchaseOrderNumber?: string;
    transactionDate?: string;
    currency?: string;
    totalLineItems?: number;
  };
  participants?: {
    sender?: string;
    receiver?: string;
    customer?: string;
    supplier?: string;
  };
  importantDates?: Array<{ label: string; value: string }>;
  lineItems?: Array<{
    itemNumber?: string;
    productName?: string;
    quantity?: number;
    unitPrice?: string;
    totalPrice?: string;
  }>;
  errors?: Array<{
    segment?: string;
    elementPosition?: string;
    description?: string;
    severity?: string;
  }>;
}

export interface HistoryEntry {
  id: string;
  fileName: string;
  uploadedAt: string; // ISO timestamp
  analysis: AIAnalysisResult;
  _firestoreId?: string; // Firestore document ID (set on read)
}

const MAX_HISTORY_ENTRIES = 20;

// ---------- localStorage fallback (used when not logged in) ----------
const LOCAL_STORAGE_KEY = "claimlens_history";
function loadLocal(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocal(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch { /* ignore */ }
}
// ---------------------------------------------------------------------

interface EDIContextType {
  aiAnalysis: AIAnalysisResult | null;
  setAIAnalysis: (result: AIAnalysisResult, fileName?: string) => void;
  loadAnalysisOnly: (result: AIAnalysisResult) => void;
  clearData: () => void;
  history: HistoryEntry[];
  historyLoading: boolean;
  clearHistory: () => void;
  removeHistoryEntry: (entry: HistoryEntry) => void;
}

const EDIContext = createContext<EDIContextType>({
  aiAnalysis: null,
  setAIAnalysis: () => {},
  loadAnalysisOnly: () => {},
  clearData: () => {},
  history: [],
  historyLoading: false,
  clearHistory: () => {},
  removeHistoryEntry: () => {},
});

export function EDIProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const [aiAnalysis, setAiAnalysisState] = useState<AIAnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Track previous uid to detect user changes
  const prevUidRef = useRef<string | null>(null);

  // Load history whenever the authenticated user changes
  useEffect(() => {
    if (uid === prevUidRef.current) return;
    prevUidRef.current = uid;

    if (!uid) {
      // Not logged in — fall back to localStorage
      setHistory(loadLocal());
      return;
    }

    setHistoryLoading(true);
    loadHistoryFromFirestore(uid)
      .then((entries) => setHistory(entries))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [uid]);

  const setAIAnalysis = async (result: AIAnalysisResult, fileName = "Unknown File") => {
    setAiAnalysisState(result);

    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fileName,
      uploadedAt: new Date().toISOString(),
      analysis: result,
    };

    if (uid) {
      try {
        const firestoreId = await addToFirestore(uid, entry);
        entry._firestoreId = firestoreId;
      } catch (err) {
        console.error("Failed to save history to Firestore:", err);
      }
    } else {
      // Guest: use localStorage
      const updated = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES);
      saveLocal(updated);
    }

    setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
  };

  const clearData = () => setAiAnalysisState(null);

  const clearHistory = async () => {
    setHistory([]);
    if (uid) {
      try {
        await clearFirestoreHistory(uid);
      } catch (err) {
        console.error("Failed to clear Firestore history:", err);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const removeHistoryEntry = async (entry: HistoryEntry) => {
    setHistory((prev) => prev.filter((e) => e.id !== entry.id));
    if (uid && entry._firestoreId) {
      try {
        await removeFromFirestore(uid, entry._firestoreId);
      } catch (err) {
        console.error("Failed to remove history entry from Firestore:", err);
      }
    } else {
      const updated = history.filter((e) => e.id !== entry.id);
      saveLocal(updated);
    }
  };

  // Use this when loading an existing entry from History — does NOT save to Firestore
  const loadAnalysisOnly = (result: AIAnalysisResult) => {
    setAiAnalysisState(result);
  };

  return (
    <EDIContext.Provider
      value={{
        aiAnalysis,
        setAIAnalysis,
        loadAnalysisOnly,
        clearData,
        history,
        historyLoading,
        clearHistory,
        removeHistoryEntry,
      }}
    >
      {children}
    </EDIContext.Provider>
  );
}

export function useEDI() {
  return useContext(EDIContext);
}
