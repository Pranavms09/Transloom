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
1. Detect the transaction type (837, 835, 834, 850, etc.)
2. Extract key fields into the EXACT JSON structure provided below.
3. Identify possible validation errors and classify their severity (Low, Medium, High).
4. Format all dates as "Month DD, YYYY" (e.g., "July 12, 2022").
5. Translate transaction codes into readable labels (e.g., 850 -> "Purchase Order", 837 -> "Healthcare Claim").

Return JSON with this EXACT structure (no markdown fences, just the raw JSON object):

{
  "fileType": "",
  "fileInformation": {
    "transactionId": "",
    "senderId": "",
    "receiverId": "",
    "interchangeControlNumber": "",
    "functionalGroupControlNumber": "",
    "transactionSetControlNumber": ""
  },
  "transactionOverview": {
    "transactionType": "",
    "purchaseOrderNumber": "",
    "transactionDate": "",
    "currency": "",
    "totalLineItems": 0
  },
  "participants": {
    "sender": "",
    "receiver": "",
    "customer": "",
    "supplier": ""
  },
  "importantDates": [
    { "label": "Order Date", "value": "" },
    { "label": "Requested Delivery", "value": "" }
  ],
  "lineItems": [
    {
      "itemNumber": "",
      "productName": "",
      "quantity": 0,
      "unitPrice": "",
      "totalPrice": ""
    }
  ],
  "errors": [
    {
      "segment": "",
      "elementPosition": "",
      "description": "",
      "severity": "High | Medium | Low"
    }
  ]
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
  // ── Build system instruction safely ─────────────────────────────────────────
  let systemInstruction = `You are ClaimLens Copilot, an expert in US Healthcare EDI (X12) transactions, HIPAA 5010 compliance, and medical billing.
Answer questions clearly and concisely. If the user uploads a file, reference it by name.
No EDI file has been uploaded yet.`;

  try {
    if (parsed && typeof parsed === "object") {
      const safeIssues = Array.isArray(issues) ? issues : (Array.isArray(parsed.errors) ? parsed.errors : []);
      
      const errorSummary = safeIssues.slice(0, 10).map(
        (i) => `- [${i.severity || "Error"}] ${i.segment || "Unknown"} (${i.elementPosition || "N/A"}): ${i.description || JSON.stringify(i)}`
      ).join("\n") || "No validation errors found.";

      const fileInfo = (parsed.fileInformation && typeof parsed.fileInformation === "object") ? parsed.fileInformation : {};
      const txOverview = (parsed.transactionOverview && typeof parsed.transactionOverview === "object") ? parsed.transactionOverview : {};
      const participants = (parsed.participants && typeof parsed.participants === "object") ? parsed.participants : {};

      const dataSummary = [
        `Transaction Type: ${parsed.fileType || "Unknown"}`,
        `Sender: ${participants.sender || fileInfo.senderId || "N/A"} → Receiver: ${participants.receiver || fileInfo.receiverId || "N/A"}`,
        `Transaction ID: ${fileInfo.transactionId || "N/A"} | Control #: ${fileInfo.interchangeControlNumber || "N/A"}`,
        `Date: ${txOverview.transactionDate || "N/A"} | Currency: ${txOverview.currency || "N/A"}`,
        `PO Number: ${txOverview.purchaseOrderNumber || "N/A"} | Line Items: ${txOverview.totalLineItems ?? (Array.isArray(parsed.lineItems) ? parsed.lineItems.length : 0)}`,
        `Customer: ${participants.customer || "N/A"} | Supplier: ${participants.supplier || "N/A"}`,
      ].join("\n");

      systemInstruction = `You are ClaimLens Copilot, an expert in US Healthcare EDI X12 transactions and HIPAA 5010 compliance.
The user has uploaded an EDI file which Gemini analyzed with these details:

**File Overview:**
${dataSummary}

**Validation Issues (first 10):**
${errorSummary}

When asked about segments, explain them in plain healthcare business language. Be concise and practical.`;
    }
  } catch (sysErr) {
    console.warn("System instruction build error (non-fatal):", sysErr);
    // fallback to generic instruction above
  }

  // ── Map messages to Gemini format ────────────────────────────────────────────
  // Frontend sends role as "user" | "assistant" | "ai" — normalize all to "user"/"model"
  const chatMessages = (Array.isArray(messages) ? messages : []).map(msg => ({
    role: (msg.role === "assistant" || msg.role === "ai" || msg.role === "model") ? "model" : "user",
    parts: [{ text: String(msg.content || "") }]
  }));

  if (chatMessages.length === 0) {
    throw new Error("No messages provided to askCopilot.");
  }

  const lastUserMessage = chatMessages[chatMessages.length - 1];
  const rawHistory = chatMessages.slice(0, -1);

  // Build valid alternating history (must start with user, alternate user/model)
  let validHistory = [];
  let expectedRole = "user";
  for (const msg of rawHistory) {
    if (msg.role === expectedRole && msg.parts[0].text.trim() !== "") {
      validHistory.push(msg);
      expectedRole = expectedRole === "user" ? "model" : "user";
    }
  }
  // Gemini requires history to end on model turn
  while (validHistory.length > 0 && validHistory[validHistory.length - 1].role !== "model") {
    validHistory.pop();
  }

  console.log("Valid History for Gemini:", JSON.stringify(validHistory, null, 2));
  console.log("Last User Message:", JSON.stringify(lastUserMessage, null, 2));

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction,
  });

  try {
    const chat = model.startChat({ history: validHistory });
    const result = await chat.sendMessage(lastUserMessage.parts[0].text);
    return result.response.text();
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    // Forward the real error message so the user sees what's actually wrong
    throw new Error(err.message || "Failed to get chat response from Gemini.");
  }
}
