// EDIContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export interface AIAnalysisResult {
  fileType: string;
  summary: any;
  readableData: any;
  errors: any[];
}

interface EDIContextType {
  aiAnalysis: AIAnalysisResult | null;
  setAIAnalysis: (result: AIAnalysisResult) => void;
  clearData: () => void;
}

const EDIContext = createContext<EDIContextType>({
  aiAnalysis: null,
  setAIAnalysis: () => {},
  clearData: () => {},
});

export function EDIProvider({ children }: { children: ReactNode }) {
  const [aiAnalysis, setAiAnalysisState] = useState<AIAnalysisResult | null>(null);

  const setAIAnalysis = (result: AIAnalysisResult) => {
    setAiAnalysisState(result);
  };

  const clearData = () => {
    setAiAnalysisState(null);
  };

  return (
    <EDIContext.Provider
      value={{
        aiAnalysis,
        setAIAnalysis,
        clearData,
      }}
    >
      {children}
    </EDIContext.Provider>
  );
}

export function useEDI() {
  return useContext(EDIContext);
}
