import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeEDI(content) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a healthcare EDI expert.

Analyze the following X12 EDI file.

Tasks:
1. Detect the transaction type (837, 835, or 834)
2. Extract key fields
3. Convert it into human readable information
4. Identify possible validation errors

Return JSON with this EXACT structure (no markdown fences, just the raw JSON object):

{
  "fileType": "",
  "summary": {},
  "readableData": {},
  "errors": []
}

EDI FILE:
${content}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/, "").replace(/```\n?/, "").trim();
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini Parsing Error:", err);
    throw new Error("Failed to analyze EDI with Gemini.");
  }
}

export async function askCopilot(messages, parsed, issues) {
  let systemInstruction = `You are ClaimLens Copilot, an expert in US Healthcare EDI (X12) transactions, HIPAA 5010 compliance, and medical billing.
Answer questions clearly and concisely. If the user uploads a file, reference it by name.
No EDI file has been uploaded yet.`;

  if (parsed) {
    const errorSummary = (issues || []).slice(0, 10).map(
      (i) => `- ${i.segment || "Error"}: ${i.description || i.message || JSON.stringify(i)}`
    ).join("\n") || "No validation errors found.";

    systemInstruction = `You are ClaimLens Copilot, an expert in US Healthcare EDI X12 transactions and HIPAA 5010 compliance.
The user has uploaded an EDI file which Gemini analyzed with the following details:

**Transaction Type:** ${parsed.fileType}
**Summary:** ${JSON.stringify(parsed.summary)}

**Validation Issues (first 10):**
${errorSummary}

**Extracted Human Readable Data:**
\`\`\`
${JSON.stringify(parsed.readableData).slice(0, 1200)}
\`\`\`

When asked about segments, explain what they mean in plain healthcare business language. Be concise and practical.`;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  const chatMessages = messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  try {
    const rawHistory = chatMessages.slice(0, -1);
    const lastUserMessage = chatMessages[chatMessages.length - 1];

    let validHistory = [];
    let expectedRole = "user";

    for (const msg of rawHistory) {
      if (msg.role === expectedRole && msg.parts[0].text && msg.parts[0].text.trim() !== "") {
        validHistory.push(msg);
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }

    while (validHistory.length > 0 && validHistory[validHistory.length - 1].role !== "model") {
      validHistory.pop();
    }

    console.log("Raw History:", JSON.stringify(rawHistory, null, 2));
    console.log("Valid History for Gemini:", JSON.stringify(validHistory, null, 2));
    console.log("Last User Message:", JSON.stringify(lastUserMessage, null, 2));

    const chat = model.startChat({ history: validHistory });

    const result = await chat.sendMessage(lastUserMessage.parts[0].text);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    throw new Error("Failed to get chat response from Gemini.");
  }
}
