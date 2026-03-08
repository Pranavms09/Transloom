// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Client — EDI-Aware Copilot
// ─────────────────────────────────────────────────────────────────────────────

import { ParsedEDI } from "./x12Parser";
import { ValidationIssue } from "./validator";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function buildSystemPrompt(parsed: ParsedEDI | null, issues: ValidationIssue[]): string {
  if (!parsed) {
    return `You are ClaimLens Copilot, an expert in US Healthcare EDI (X12) transactions, HIPAA 5010 compliance, and medical billing. 
Answer questions clearly and concisely. If the user uploads a file, reference it by name.
No EDI file has been uploaded yet.`;
  }

  const errorSummary = issues.slice(0, 10).map(
    (i) => `- [${i.severity}] ${i.segment} / ${i.position}: ${i.description}`
  ).join("\n") || "No validation errors found.";

  return `You are ClaimLens Copilot, an expert in US Healthcare EDI X12 transactions and HIPAA 5010 compliance.
The user has uploaded an EDI file with the following details:

**File:** ${parsed.fileInfo.name}
**Transaction Type:** ${parsed.fileInfo.type}
**Segments:** ${parsed.fileInfo.segmentCount}
**Sender:** ${parsed.fileInfo.senderId}
**Receiver:** ${parsed.fileInfo.receiverId}
**Version:** ${parsed.fileInfo.version}

**Validation Issues (first 10):**
${errorSummary}

**Raw EDI (first 1200 chars):**
\`\`\`
${parsed.rawText.slice(0, 1200)}
\`\`\`

When asked about segments, explain what they mean in plain healthcare business language. Reference the specific segment IDs and element positions from the file above. Be concise and practical.`;
}

export async function askCopilot(
  messages: ChatMessage[],
  parsed: ParsedEDI | null,
  issues: ValidationIssue[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "sk-placeholder") {
    // Fallback: rule-based responses for demo when no key is set
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    return getFallbackResponse(lastMsg, parsed, issues);
  }

  const systemPrompt = buildSystemPrompt(parsed, issues);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response received.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback Pattern-Matched Responses (no API key needed)
// ─────────────────────────────────────────────────────────────────────────────
function getFallbackResponse(
  msg: string,
  parsed: ParsedEDI | null,
  issues: ValidationIssue[]
): string {
  if (!parsed) {
    return "No EDI file is currently loaded. Please upload a file on the Upload page, then I can answer specific questions about it.";
  }

  const txType = parsed.fileInfo.type;

  if (msg.includes("clm") || msg.includes("claim")) {
    return `The **CLM** segment is the Claim Information segment in an ${txType} transaction. It contains:\n- **CLM01**: Claim submitter's identifier (your internal claim number)\n- **CLM02**: Total charge amount (must equal the sum of all SV1/SV2 line charges)\n- **CLM05**: Place of service code (e.g. 11 = Office, 21 = Inpatient Hospital)\n\nFor your file *${parsed.fileInfo.name}*, look for CLM segments in the Loop 2300 (Claim Information) area.`;
  }
  if (msg.includes("nm1") || msg.includes("name")) {
    return `The **NM1** segment identifies an individual or organization. Key qualifiers:\n- **NM101=85**: Billing Provider\n- **NM101=IL**: Subscriber/Insured\n- **NM101=QC**: Patient\n- **NM101=PR**: Payer\n\nWhen NM108='XX', NM109 must be a valid 10-digit NPI (passes Luhn algorithm check).`;
  }
  if (msg.includes("npi") || msg.includes("luhn")) {
    return `An NPI (National Provider Identifier) is a 10-digit number. HIPAA requires it to pass a **Luhn algorithm** validation. The check works by prepending '80840' to the 10-digit NPI and verifying the combined number's Luhn checksum equals 0.\n\nIf you see "Invalid NPI" errors, verify the NPI at the CMS NPI Registry: https://npiregistry.cms.hhs.gov`;
  }
  if (msg.includes("835") || msg.includes("remittance") || msg.includes("era")) {
    return `The **835 Electronic Remittance Advice (ERA)** explains how a payer processed and paid claims:\n- **CLP**: Claim-level payment info (billed/paid/patient responsibility)\n- **CAS**: Adjustment reasons with Group Code + Reason Code + Amount\n- **SVC**: Service line adjustments\n\nCommon CAS group codes: CO=Contractual Obligation, PR=Patient Responsibility, OA=Other Adjustment.`;
  }
  if (msg.includes("834") || msg.includes("enrollment") || msg.includes("member")) {
    return `The **834 Benefit Enrollment** transaction sends member enrollment data from an employer/sponsor to a health plan:\n- **INS**: Member relationship (INS01=Y for subscriber, N for dependent)\n- **NM1*IL**: Member name and ID\n- **HD**: Coverage type (Medical, Dental, Vision)\n- **DTP*356**: Coverage effective date\n- **DTP*357**: Coverage termination date`;
  }
  if (msg.includes("error") || msg.includes("reject") || msg.includes("why")) {
    if (issues.length === 0) {
      return `Good news — your file *${parsed.fileInfo.name}* passed all validation checks! No HIPAA 5010 errors were found.`;
    }
    const critical = issues.filter((i) => i.severity === "Critical");
    const top = critical[0] || issues[0];
    return `Your file *${parsed.fileInfo.name}* has **${issues.length} validation issue(s)** (${critical.length} critical).\n\nTop issue:\n> **[${top.severity}] ${top.segment} / ${top.position}**: ${top.description}\n\nSee the Validation page for the complete error list with fix suggestions.`;
  }
  if (msg.includes("isa") || msg.includes("interchange")) {
    return `The **ISA** (Interchange Control Header) is the outermost envelope of an X12 file. It identifies the sender (ISA06), receiver (ISA08), the date (ISA09), and sets the delimiters used throughout the file. The matching **IEA** segment closes the envelope.\n\nYour file was sent from *${parsed.fileInfo.senderId}* to *${parsed.fileInfo.receiverId}*.`;
  }
  if (msg.includes("hl") || msg.includes("hierarchical") || msg.includes("loop")) {
    return `The **HL** (Hierarchical Level) segment creates parent-child relationships in 837 transactions:\n- **HL03=20**: Billing Provider Level (Loop 2000A)\n- **HL03=22**: Subscriber Level (Loop 2000B)\n- **HL03=23**: Patient Level (Loop 2000C)\n\nEach HL has a unique ID (HL01) and references its parent (HL02). This structure lets you send claims for multiple patients under one billing provider in a single transaction.`;
  }

  return `I'm analyzing your **${txType}** file *${parsed.fileInfo.name}* (${parsed.fileInfo.segmentCount} segments, ${issues.length} issues).\n\nI can explain any segment (CLM, NM1, ISA, HL, CAS, etc.), help you understand validation errors, or describe HIPAA 5010 rules. What would you like to know?\n\n> 💡 Tip: Add your OpenAI API key to \`.env.local\` as \`VITE_OPENAI_API_KEY\` for full AI-powered responses.`;
}
