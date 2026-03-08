import { AIAnalysisResult } from "../contexts/EDIContext";
import { askCopilot as geminiAskCopilot } from "../../services/geminiService";

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "ai";
  content: string;
}

export async function askCopilot(
  messages: ChatMessage[],
  parsed: AIAnalysisResult | null,
  issues: any[]
): Promise<string> {
  // Now calling the service directly in the frontend since Netlify doesn't run the backend
  return geminiAskCopilot(messages, parsed, issues);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Pattern-Matched Responses (Now exclusively server driven)
// ─────────────────────────────────────────────────────────────────────────────
