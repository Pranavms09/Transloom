// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Client — EDI-Aware Copilot
// ─────────────────────────────────────────────────────────────────────────────

import { AIAnalysisResult } from "../contexts/EDIContext";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function askCopilot(
  messages: ChatMessage[],
  parsed: AIAnalysisResult | null,
  issues: any[]
): Promise<string> {
  const response = await fetch("/api/ask-copilot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      parsed,
      issues
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Server error ${response.status}: ${errBody.error || "Unknown server error"}`);
  }

  const data = await response.json();
  return data.text || "No response received.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Pattern-Matched Responses (Now exclusively server driven)
// ─────────────────────────────────────────────────────────────────────────────
