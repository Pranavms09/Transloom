// ─────────────────────────────────────────────────────────────────────────────
// ClaimLens X12 Parser  –  Full HIPAA 5010 Tokenizer & Loop Builder
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionType = "837P" | "837I" | "835" | "834" | "UNKNOWN";

export interface X12Segment {
  id: string;
  elements: string[];
  raw: string;
  index: number; // position in file
}

export interface X12Element {
  name: string;
  value: string;
  elementIndex: number;
}

export interface X12Loop {
  loopId: string;
  name: string;
  segments: X12Segment[];
  children: X12Loop[];
}

export interface Delimiters {
  element: string;
  subElement: string;
  segment: string;
  repetition: string;
}

export interface FileInfo {
  name: string;
  size: string;
  type: TransactionType;
  segmentCount: number;
  interchangeControlNumber: string;
  senderId: string;
  receiverId: string;
  date: string;
  version: string;
}

export interface ParsedEDI {
  fileInfo: FileInfo;
  delimiters: Delimiters;
  rawSegments: X12Segment[];
  loopTree: X12Loop[];
  // Transaction-specific extracted data
  clpLoops?: CLP835[];       // For 835
  memberLoops?: Member834[]; // For 834
  claimLoops?: Claim837[];   // For 837
  rawText: string;
}

// 835-specific
export interface CasAdjustment {
  groupCode: string;
  reasonCode: string;
  amount: number;
}

export interface CLP835 {
  claimId: string;
  statusCode: string;
  billedAmount: number;
  paidAmount: number;
  patientResponsibility: number;
  adjustments: CasAdjustment[];
  claimFilingIndicator: string;
}

// 834-specific
export interface Member834 {
  memberId: string;
  lastName: string;
  firstName: string;
  subscriberIndicator: string;
  relationship: string;
  effectiveDate: string;
  termDate: string;
  birthDate: string;
  gender: string;
}

// 837-specific
export interface ServiceLine837 {
  lineNumber: number;
  procedureCode: string;
  modifiers: string[];
  chargeAmount: number;
  units: number;
  placeOfService: string;
  diagnosisPointers: string;
  serviceDate: string;
}

export interface Claim837 {
  claimId: string;
  totalCharges: number;
  placeOfService: string;
  billingNpi: string;
  billingName: string;
  patientName: string;
  subscriberMemberId: string;
  diagnosisCodes: string[];
  serviceLines: ServiceLine837[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Delimiter Detection from ISA segment
// ─────────────────────────────────────────────────────────────────────────────
function detectDelimiters(raw: string): Delimiters {
  // ISA is always 106 chars; element sep is at pos 3, sub-element sep is at pos 104
  // segment terminator is the char right after the end of ISA
  if (raw.length < 106) {
    return { element: "*", subElement: ":", segment: "~", repetition: "^" };
  }
  const element = raw[3];
  const repetition = raw[82];
  const subElement = raw[104];
  // Segment terminator is char at position 105 (right after ISA's last element)
  const segment = raw[105];
  return { element, subElement, segment, repetition };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Parse Entry Point
// ─────────────────────────────────────────────────────────────────────────────
export function parseX12(rawText: string, fileName = ""): ParsedEDI {
  // Normalise line endings
  const text = rawText.replace(/\r\n/g, "").replace(/\r/g, "");

  const delimiters = detectDelimiters(text);

  // Split into segments, filtering empty
  const rawSegs = text
    .split(delimiters.segment)
    .map((s) => s.trim())
    .filter(Boolean);

  const rawSegments: X12Segment[] = rawSegs.map((seg, i) => {
    const elements = seg.split(delimiters.element);
    return { id: elements[0], elements, raw: seg, index: i };
  });

  const txType = detectTransactionType(rawSegments);
  const fileInfo = extractFileInfo(rawSegments, txType, fileName, rawText.length);
  fileInfo.segmentCount = rawSegments.length;

  const loopTree = buildLoopTree(rawSegments, txType, delimiters);

  const result: ParsedEDI = {
    fileInfo,
    delimiters,
    rawSegments,
    loopTree,
    rawText: rawText.slice(0, 4000), // cap to avoid memory bloat in context
  };

  // Transaction-specific extraction
  if (txType === "835") {
    result.clpLoops = extract835CLP(rawSegments);
  } else if (txType === "834") {
    result.memberLoops = extract834Members(rawSegments, delimiters);
  } else if (txType === "837P" || txType === "837I") {
    result.claimLoops = extract837Claims(rawSegments, delimiters);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Type Detection
// ─────────────────────────────────────────────────────────────────────────────
export function detectTransactionType(segments: X12Segment[]): TransactionType {
  const gs = segments.find((s) => s.id === "GS");
  const st = segments.find((s) => s.id === "ST");

  const gsCode = gs?.elements[1] || "";
  const stCode = st?.elements[1] || "";
  const version = gs?.elements[8] || "";

  if (stCode === "837" || gsCode === "HC") {
    if (version.includes("X222") || version.includes("X223")) return "837P";
    if (version.includes("X223")) return "837I";
    return "837P"; // default for HC
  }
  if (stCode === "835" || gsCode === "HP") return "835";
  if (stCode === "834" || gsCode === "BE") return "834";
  if (stCode === "837") {
    return version.includes("X223") ? "837I" : "837P";
  }
  return "UNKNOWN";
}

// ─────────────────────────────────────────────────────────────────────────────
// Extract ISA-level file metadata
// ─────────────────────────────────────────────────────────────────────────────
function extractFileInfo(
  segments: X12Segment[],
  type: TransactionType,
  fileName: string,
  byteSize: number
): FileInfo {
  const isa = segments.find((s) => s.id === "ISA");
  const sizeKB = (byteSize / 1024).toFixed(2) + " KB";

  return {
    name: fileName,
    size: sizeKB,
    type,
    segmentCount: 0,
    interchangeControlNumber: isa?.elements[13] || "",
    senderId: (isa?.elements[6] || "").trim(),
    receiverId: (isa?.elements[8] || "").trim(),
    date: formatISADate(isa?.elements[9] || ""),
    version: isa?.elements[12] || "",
  };
}

function formatISADate(d: string): string {
  if (d.length === 6) {
    return `20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;
  }
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Loop Tree Builder
// ─────────────────────────────────────────────────────────────────────────────
export function buildLoopTree(
  segments: X12Segment[],
  txType: TransactionType,
  _delimiters: Delimiters
): X12Loop[] {
  if (txType === "835") return build835Tree(segments);
  if (txType === "834") return build834Tree(segments);
  if (txType === "837P" || txType === "837I") return build837Tree(segments);
  return buildGenericTree(segments);
}

// ── Generic tree (envelope only) ─────────────────────────────────────────────
function buildGenericTree(segments: X12Segment[]): X12Loop[] {
  const root: X12Loop = {
    loopId: "ROOT",
    name: "Transaction",
    segments: [],
    children: [],
  };
  for (const seg of segments) {
    root.segments.push(seg);
  }
  return [root];
}

// ── 837 Loop Builder ─────────────────────────────────────────────────────────
function build837Tree(segments: X12Segment[]): X12Loop[] {
  const envelope: X12Loop = makeLoop("ENVELOPE", "Interchange Envelope");
  const transaction: X12Loop = makeLoop("TX", "Transaction Set");
  const loop1000A: X12Loop = makeLoop("1000A", "Submitter Name");
  const loop1000B: X12Loop = makeLoop("1000B", "Receiver Name");

  let currentBilling: X12Loop | null = null;
  let currentSubscriber: X12Loop | null = null;
  let currentPatient: X12Loop | null = null;
  let currentClaim: X12Loop | null = null;
  let currentService: X12Loop | null = null;
  let in1000A = false;
  let in1000B = false;

  const tree: X12Loop[] = [envelope];

  for (const seg of segments) {
    const id = seg.id;

    if (["ISA", "IEA", "GS", "GE"].includes(id)) {
      envelope.segments.push(seg);
      continue;
    }
    if (id === "ST" || id === "SE" || id === "BPR" || id === "TRN") {
      transaction.segments.push(seg);
      continue;
    }

    // 1000A – Submitter
    if (id === "NM1" && seg.elements[1] === "41") {
      in1000A = true; in1000B = false;
    }
    // 1000B – Receiver
    if (id === "NM1" && seg.elements[1] === "40") {
      in1000A = false; in1000B = true;
    }
    if (in1000A && !["HL"].includes(id)) {
      loop1000A.segments.push(seg);
      continue;
    }
    if (in1000B && !["HL"].includes(id)) {
      loop1000B.segments.push(seg);
      continue;
    }

    // HL loops
    if (id === "HL") {
      in1000A = false; in1000B = false;
      const levelCode = seg.elements[3];
      if (levelCode === "20") {
        // Billing Provider
        currentBilling = makeLoop("2000A", `Billing Provider (HL ${seg.elements[1]})`);
        transaction.children.push(currentBilling);
        currentBilling.segments.push(seg);
      } else if (levelCode === "22") {
        // Subscriber
        currentSubscriber = makeLoop("2000B", `Subscriber (HL ${seg.elements[1]})`);
        if (currentBilling) currentBilling.children.push(currentSubscriber);
        currentSubscriber.segments.push(seg);
        currentClaim = null;
      } else if (levelCode === "23") {
        // Patient
        currentPatient = makeLoop("2000C", `Patient (HL ${seg.elements[1]})`);
        if (currentSubscriber) currentSubscriber.children.push(currentPatient);
        currentPatient.segments.push(seg);
      }
      continue;
    }

    // Service line
    if (id === "LX") {
      currentService = makeLoop("2400", `Service Line ${seg.elements[1]}`);
      if (currentClaim) currentClaim.children.push(currentService);
      currentService.segments.push(seg);
      continue;
    }

    // Claim header
    if (id === "CLM") {
      currentClaim = makeLoop("2300", `Claim ${seg.elements[1]}`);
      const target = currentPatient ?? currentSubscriber;
      if (target) target.children.push(currentClaim);
      currentService = null;
      currentClaim.segments.push(seg);
      continue;
    }

    // Assign to deepest active loop
    const target = currentService ?? currentClaim ?? currentPatient ?? currentSubscriber ?? currentBilling ?? transaction;
    target.segments.push(seg);
  }

  // Assemble
  if (loop1000A.segments.length) transaction.children.unshift(loop1000A);
  if (loop1000B.segments.length) transaction.children.splice(1, 0, loop1000B);
  if (transaction.segments.length || transaction.children.length) {
    envelope.children.push(transaction);
  }

  return tree;
}

// ── 835 Loop Builder ─────────────────────────────────────────────────────────
function build835Tree(segments: X12Segment[]): X12Loop[] {
  const envelope: X12Loop = makeLoop("ENVELOPE", "Interchange Envelope");
  const transaction: X12Loop = makeLoop("TX", "Transaction Set (835)");
  const loop1000A: X12Loop = makeLoop("1000A", "Payer Identification");
  const loop1000B: X12Loop = makeLoop("1000B", "Payee Identification");

  let currentCLP: X12Loop | null = null;
  let currentSVC: X12Loop | null = null;
  let in1000A = false;
  let in1000B = false;

  for (const seg of segments) {
    const id = seg.id;

    if (["ISA", "IEA", "GS", "GE"].includes(id)) { envelope.segments.push(seg); continue; }
    if (["ST", "SE", "BPR", "TRN", "DTM", "REF"].includes(id) && !currentCLP) { transaction.segments.push(seg); continue; }

    if (id === "N1" && seg.elements[1] === "PR") { in1000A = true; in1000B = false; }
    if (id === "N1" && seg.elements[1] === "PE") { in1000A = false; in1000B = true; }
    if (in1000A && id !== "CLP") { loop1000A.segments.push(seg); continue; }
    if (in1000B && id !== "CLP") { loop1000B.segments.push(seg); continue; }

    if (id === "CLP") {
      in1000A = false; in1000B = false;
      currentCLP = makeLoop("2100", `Claim ${seg.elements[1]}`);
      transaction.children.push(currentCLP);
      currentCLP.segments.push(seg);
      currentSVC = null;
      continue;
    }

    if (id === "SVC") {
      currentSVC = makeLoop("2110", `Service ${seg.elements[1]}`);
      if (currentCLP) currentCLP.children.push(currentSVC);
      currentSVC.segments.push(seg);
      continue;
    }

    const target = currentSVC ?? currentCLP ?? transaction;
    target.segments.push(seg);
  }

  if (loop1000A.segments.length) transaction.children.unshift(loop1000A);
  if (loop1000B.segments.length) transaction.children.splice(1, 0, loop1000B);
  envelope.children.push(transaction);
  return [envelope];
}

// ── 834 Loop Builder ─────────────────────────────────────────────────────────
function build834Tree(segments: X12Segment[]): X12Loop[] {
  const envelope: X12Loop = makeLoop("ENVELOPE", "Interchange Envelope");
  const transaction: X12Loop = makeLoop("TX", "Transaction Set (834)");
  const loop1000A: X12Loop = makeLoop("1000A", "Sponsor Name");
  const loop1000B: X12Loop = makeLoop("1000B", "Payer");
  const loop1000C: X12Loop = makeLoop("1000C", "TPA / Broker");

  let currentMember: X12Loop | null = null;
  let currentCoverage: X12Loop | null = null;
  let in1000 = 0;

  for (const seg of segments) {
    const id = seg.id;

    if (["ISA", "IEA", "GS", "GE"].includes(id)) { envelope.segments.push(seg); continue; }
    if (["ST", "SE", "BGN", "REF", "DTP"].includes(id) && !currentMember) { transaction.segments.push(seg); continue; }

    if (id === "N1") {
      const q = seg.elements[1];
      if (q === "P5") { in1000 = 1; currentMember = null; }
      else if (q === "IN") { in1000 = 2; currentMember = null; }
      else if (q === "BO" || q === "TV") { in1000 = 3; currentMember = null; }
    }
    if (in1000 === 1 && !currentMember) { loop1000A.segments.push(seg); continue; }
    if (in1000 === 2 && !currentMember) { loop1000B.segments.push(seg); continue; }
    if (in1000 === 3 && !currentMember) { loop1000C.segments.push(seg); continue; }

    if (id === "INS") {
      in1000 = 0;
      currentMember = makeLoop("2000", `Member ${seg.elements[1] === "Y" ? "Subscriber" : "Dependent"}`);
      transaction.children.push(currentMember);
      currentMember.segments.push(seg);
      currentCoverage = null;
      continue;
    }

    if (id === "HD") {
      currentCoverage = makeLoop("2300", "Coverage");
      if (currentMember) currentMember.children.push(currentCoverage);
      currentCoverage.segments.push(seg);
      continue;
    }

    const target = currentCoverage ?? currentMember ?? transaction;
    target.segments.push(seg);
  }

  if (loop1000A.segments.length) transaction.children.unshift(loop1000A);
  if (loop1000B.segments.length) transaction.children.splice(1, 0, loop1000B);
  if (loop1000C.segments.length) transaction.children.splice(2, 0, loop1000C);
  envelope.children.push(transaction);
  return [envelope];
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction-Specific Data Extractors
// ─────────────────────────────────────────────────────────────────────────────

export function extract835CLP(segments: X12Segment[]): CLP835[] {
  const results: CLP835[] = [];
  let current: CLP835 | null = null;

  for (const seg of segments) {
    if (seg.id === "CLP") {
      if (current) results.push(current);
      current = {
        claimId: seg.elements[1] || "",
        statusCode: seg.elements[2] || "",
        billedAmount: parseFloat(seg.elements[3]) || 0,
        paidAmount: parseFloat(seg.elements[4]) || 0,
        patientResponsibility: parseFloat(seg.elements[5]) || 0,
        claimFilingIndicator: seg.elements[6] || "",
        adjustments: [],
      };
    } else if (seg.id === "CAS" && current) {
      // Each CAS can have up to 6 reason code triplets
      for (let i = 2; i < seg.elements.length - 1; i += 3) {
        const reasonCode = seg.elements[i];
        const amount = parseFloat(seg.elements[i + 1]);
        if (reasonCode && !isNaN(amount)) {
          current.adjustments.push({
            groupCode: seg.elements[1] || "",
            reasonCode,
            amount,
          });
        }
      }
    }
  }
  if (current) results.push(current);
  return results;
}

export function extract834Members(
  segments: X12Segment[],
  _delimiters: Delimiters
): Member834[] {
  const results: Member834[] = [];
  let current: Member834 | null = null;
  let lastNM1: string[] = [];

  for (const seg of segments) {
    if (seg.id === "INS") {
      if (current) results.push(current);
      current = {
        memberId: "",
        lastName: "",
        firstName: "",
        subscriberIndicator: seg.elements[1] || "",
        relationship: seg.elements[2] || "",
        effectiveDate: "",
        termDate: "",
        birthDate: "",
        gender: "",
      };
    } else if (seg.id === "NM1" && current) {
      lastNM1 = seg.elements;
      current.lastName = seg.elements[3] || "";
      current.firstName = seg.elements[4] || "";
      current.memberId = seg.elements[9] || "";
    } else if (seg.id === "REF" && current && lastNM1.length) {
      if (!current.memberId) current.memberId = seg.elements[2] || "";
    } else if (seg.id === "DTP" && current) {
      const q = seg.elements[1];
      const val = seg.elements[3] || "";
      if (q === "356") current.effectiveDate = formatDate8(val);
      else if (q === "357") current.termDate = formatDate8(val);
      else if (q === "340") current.birthDate = formatDate8(val);
    } else if (seg.id === "DMG" && current) {
      current.birthDate = formatDate8(seg.elements[2] || "");
      current.gender = seg.elements[3] || "";
    }
  }

  if (current) results.push(current);
  return results;
}

export function extract837Claims(
  segments: X12Segment[],
  _delimiters: Delimiters
): Claim837[] {
  const results: Claim837[] = [];
  let current: Claim837 | null = null;
  let currentService: ServiceLine837 | null = null;
  let billingNpi = "";
  let billingName = "";
  let patientName = "";
  let subscriberMemberId = "";

  for (const seg of segments) {
    if (seg.id === "NM1") {
      const entityCode = seg.elements[1];
      const npi = seg.elements[9] || "";
      const name = `${seg.elements[3] || ""}, ${seg.elements[4] || ""}`.trim().replace(/^,\s*/, "");
      if (entityCode === "85") { billingNpi = npi; billingName = name; }
      if (entityCode === "IL") { subscriberMemberId = npi; }
      if (entityCode === "QC" || entityCode === "IL") { patientName = name; }
    }

    if (seg.id === "CLM") {
      if (current) {
        if (currentService) { current.serviceLines.push(currentService); currentService = null; }
        results.push(current);
      }
      current = {
        claimId: seg.elements[1] || "",
        totalCharges: parseFloat(seg.elements[2]) || 0,
        placeOfService: (seg.elements[5] || "").split(":")[0],
        billingNpi,
        billingName,
        patientName,
        subscriberMemberId,
        diagnosisCodes: [],
        serviceLines: [],
      };
      currentService = null;
    } else if (seg.id === "HI" && current) {
      for (let i = 1; i < seg.elements.length; i++) {
        const code = seg.elements[i].split(":")[1];
        if (code) current.diagnosisCodes.push(code);
      }
    } else if (seg.id === "LX" && current) {
      if (currentService) current.serviceLines.push(currentService);
      currentService = {
        lineNumber: parseInt(seg.elements[1]) || 0,
        procedureCode: "",
        modifiers: [],
        chargeAmount: 0,
        units: 0,
        placeOfService: "",
        diagnosisPointers: "",
        serviceDate: "",
      };
    } else if ((seg.id === "SV1" || seg.id === "SV2") && currentService) {
      const proc = seg.elements[1].split(":");
      currentService.procedureCode = proc[1] || proc[0] || "";
      currentService.modifiers = [proc[2], proc[3], proc[4], proc[5]].filter(Boolean);
      currentService.chargeAmount = parseFloat(seg.elements[2]) || 0;
      currentService.units = parseFloat(seg.elements[4]) || 1;
      currentService.placeOfService = seg.elements[5] || "";
      currentService.diagnosisPointers = seg.elements[7] || "";
    } else if (seg.id === "DTP" && seg.elements[1] === "472" && currentService) {
      currentService.serviceDate = formatDate8(seg.elements[3] || "");
    }
  }

  if (current) {
    if (currentService) current.serviceLines.push(currentService);
    results.push(current);
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function makeLoop(loopId: string, name: string): X12Loop {
  return { loopId, name, segments: [], children: [] };
}

export function formatDate8(d: string): string {
  if (d.length === 8)
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  return d;
}

export function getElement(seg: X12Segment, idx: number): string {
  return (seg.elements[idx] || "").trim();
}
