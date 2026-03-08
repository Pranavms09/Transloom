// ─────────────────────────────────────────────────────────────────────────────
// HIPAA 5010 Validation Rules + Validator Engine
// ─────────────────────────────────────────────────────────────────────────────

import { validateICD10 } from "./icd10Validator";
import { validateCPT } from "./cptValidator";
import { ParsedEDI, TransactionType, X12Segment } from "./x12Parser";

export type Severity = "Critical" | "Warning" | "Info";

export interface ValidationIssue {
  id: string;
  segment: string;
  position: string;
  type: string;
  description: string;
  severity: Severity;
  loop?: string;
}

type RuleCheck = (segments: X12Segment[], parsed: ParsedEDI) => ValidationIssue[];

interface ValidationRule {
  id: string;
  txTypes: TransactionType[] | "ALL";
  run: RuleCheck;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function issue(
  id: string,
  severity: Severity,
  segment: string,
  position: string,
  type: string,
  description: string,
  loop?: string
): ValidationIssue {
  return { id, segment, position, type, description, severity, loop };
}

function getEl(seg: X12Segment, idx: number): string {
  return (seg.elements[idx] || "").trim();
}

// NPI Luhn Algorithm Check
function isValidNPI(npi: string): boolean {
  if (!/^\d{10}$/.test(npi)) return false;
  // Prepend "80840" per HIPAA Luhn standard
  const padded = "80840" + npi;
  let sum = 0;
  for (let i = padded.length - 1; i >= 0; i--) {
    let d = parseInt(padded[i]);
    if ((padded.length - 1 - i) % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// Date format CCYYMMDD
function isValidDate8(d: string): boolean {
  if (!/^\d{8}$/.test(d)) return false;
  const y = parseInt(d.slice(0, 4));
  const m = parseInt(d.slice(4, 6));
  const day = parseInt(d.slice(6, 8));
  return y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && day >= 1 && day <= 31;
}

// Date format YYMMDD
function isValidDate6(d: string): boolean {
  if (!/^\d{6}$/.test(d)) return false;
  const m = parseInt(d.slice(2, 4));
  const day = parseInt(d.slice(4, 6));
  return m >= 1 && m <= 12 && day >= 1 && day <= 31;
}

function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule Definitions
// ─────────────────────────────────────────────────────────────────────────────
const rules: ValidationRule[] = [

  // ── ISA Envelope Rules ───────────────────────────────────────────────────
  {
    id: "ISA-001",
    txTypes: "ALL",
    run(segments) {
      const isa = segments.find((s) => s.id === "ISA");
      if (!isa) {
        return [issue("ISA-001", "Critical", "ISA", "ISA", "Syntax Error", "ISA (Interchange Control Header) segment is missing.")];
      }
      const issues: ValidationIssue[] = [];
      const date = getEl(isa, 9);
      if (!isValidDate6(date)) {
        issues.push(issue("ISA-002", "Warning", "ISA", "ISA09", "Format Error", `Interchange Date '${date}' is not valid YYMMDD format.`));
      }
      if (getEl(isa, 13).length === 0) {
        issues.push(issue("ISA-003", "Critical", "ISA", "ISA13", "Missing Element", "Interchange Control Number (ISA13) is required."));
      }
      return issues;
    },
  },

  // ── ST Segment Rules ─────────────────────────────────────────────────────
  {
    id: "ST-001",
    txTypes: "ALL",
    run(segments) {
      const st = segments.find((s) => s.id === "ST");
      if (!st) {
        return [issue("ST-001", "Critical", "ST", "ST", "Syntax Error", "ST (Transaction Set Header) segment is missing.")];
      }
      const code = getEl(st, 1);
      if (!["837", "835", "834", "277", "999", "270", "271"].includes(code)) {
        return [issue("ST-002", "Warning", "ST", "ST01", "Unknown Transaction", `Transaction Set Identifier '${code}' is not a recognized HIPAA transaction.`)];
      }
      return [];
    },
  },

  // ── NPI Validation ───────────────────────────────────────────────────────
  {
    id: "NM1-001",
    txTypes: ["837P", "837I"],
    run(segments) {
      const issues: ValidationIssue[] = [];
      for (const seg of segments.filter((s) => s.id === "NM1")) {
        const qualifier = getEl(seg, 8); // NM108
        const npi = getEl(seg, 9);       // NM109
        if (qualifier === "XX") {
          if (!npi) {
            issues.push(issue(
              `NM1-001-${seg.index}`, "Critical",
              `NM1*${getEl(seg, 1)}`, "NM109",
              "Missing NPI",
              `NM1 segment (entity ${getEl(seg, 1)}): NPI (NM109) is required when qualifier is XX but is missing.`
            ));
          } else if (!isValidNPI(npi)) {
            issues.push(issue(
              `NM1-002-${seg.index}`, "Critical",
              `NM1*${getEl(seg, 1)}`, "NM109",
              "Invalid NPI",
              `NPI '${npi}' fails the Luhn algorithm check. Verify this is a valid 10-digit NPI.`
            ));
          }
        }
        if (qualifier === "MI" && !npi) {
          issues.push(issue(
            `NM1-003-${seg.index}`, "Critical",
            `NM1*${getEl(seg, 1)}`, "NM109",
            "Missing Member ID",
            `NM1 segment (entity ${getEl(seg, 1)}): Member ID (NM109) is required when qualifier is MI.`
          ));
        }
      }
      return issues;
    },
  },

  // ── CLM Total vs Service Lines ───────────────────────────────────────────
  {
    id: "CLM-001",
    txTypes: ["837P", "837I"],
    run(_segments, parsed) {
      if (!parsed.claimLoops) return [];
      const issues: ValidationIssue[] = [];
      for (const claim of parsed.claimLoops) {
        const lineSum = claim.serviceLines.reduce((a, l) => a + l.chargeAmount, 0);
        if (claim.serviceLines.length > 0 && Math.abs(claim.totalCharges - lineSum) > 0.01) {
          issues.push(issue(
            `CLM-001-${claim.claimId}`, "Critical",
            `CLM*${claim.claimId}`, "CLM02",
            "Balance Error",
            `Claim ${claim.claimId}: Total charge $${claim.totalCharges.toFixed(2)} does not match sum of service lines $${lineSum.toFixed(2)}. Difference: $${Math.abs(claim.totalCharges - lineSum).toFixed(2)}.`
          ));
        }
        if (claim.diagnosisCodes.length === 0) {
          issues.push(issue(
            `CLM-002-${claim.claimId}`, "Critical",
            `HI (Claim ${claim.claimId})`, "HI01",
            "Missing Diagnosis",
            `Claim ${claim.claimId}: No ICD-10 diagnosis codes found. At least one principal diagnosis is required.`
          ));
        } else {
          for (const diag of claim.diagnosisCodes) {
            if (!validateICD10(diag)) {
              issues.push(issue(
                `CLM-004-${claim.claimId}-${diag}`, "Warning",
                `HI (Claim ${claim.claimId})`, "HI / ICD-10",
                "Invalid Diagnosis",
                `ICD-10 Code '${diag}' is not recognized in the validator dataset.`
              ));
            }
          }
        }

        for (const svc of claim.serviceLines) {
          if (!validateCPT(svc.procedureCode)) {
            issues.push(issue(
              `SV1-001-${claim.claimId}-${svc.procedureCode}`, "Warning",
              `SV1 (Claim ${claim.claimId})`, "SV101",
              "Invalid Procedure Code",
              `CPT/HCPCS Code '${svc.procedureCode}' is not recognized in the validator dataset.`
            ));
          }
        }
      }
      return issues;
    },
  },

  // ── DTP Date Format Checks ───────────────────────────────────────────────
  {
    id: "DTP-001",
    txTypes: "ALL",
    run(segments) {
      const issues: ValidationIssue[] = [];
      for (const seg of segments.filter((s) => s.id === "DTP")) {
        const fmt = getEl(seg, 2); // DTP02
        const val = getEl(seg, 3); // DTP03
        const q = getEl(seg, 1);
        if (fmt === "D8" && val && !isValidDate8(val)) {
          issues.push(issue(
            `DTP-001-${seg.index}`, "Warning",
            `DTP*${q}`, "DTP03",
            "Date Format Error",
            `DTP (qualifier ${q}): Date '${val}' is invalid. Expected CCYYMMDD format (e.g. 20230815).`
          ));
        }
        if (fmt === "RD8") {
          const parts = val.split("-");
          if (parts.length === 2 && (!isValidDate8(parts[0]) || !isValidDate8(parts[1]))) {
            issues.push(issue(
              `DTP-002-${seg.index}`, "Warning",
              `DTP*${q}`, "DTP03",
              "Date Range Format Error",
              `DTP (qualifier ${q}): Date range '${val}' is invalid. Expected CCYYMMDD-CCYYMMDD format.`
            ));
          }
        }
      }
      return issues;
    },
  },

  // ── Address / ZIP Codes ──────────────────────────────────────────────────
  {
    id: "N4-001",
    txTypes: "ALL",
    run(segments) {
      const issues: ValidationIssue[] = [];
      for (const seg of segments.filter((s) => s.id === "N4")) {
        const zip = getEl(seg, 3);
        if (zip && !isValidZip(zip)) {
          issues.push(issue(
            `N4-001-${seg.index}`, "Warning",
            "N4", "N403",
            "ZIP Format Error",
            `ZIP code '${zip}' is not valid. Expected 5-digit (12345) or 9-digit (12345-6789) format.`
          ));
        }
      }
      return issues;
    },
  },

  // ── 835 Payment Reconciliation ───────────────────────────────────────────
  {
    id: "CLP-001",
    txTypes: ["835"],
    run(_segments, parsed) {
      if (!parsed.clpLoops) return [];
      const issues: ValidationIssue[] = [];
      for (const clp of parsed.clpLoops) {
        const expected = clp.billedAmount - clp.adjustments.reduce((a, c) => a + c.amount, 0);
        if (Math.abs(expected - clp.paidAmount) > 0.02 && clp.adjustments.length > 0) {
          issues.push(issue(
            `CLP-001-${clp.claimId}`, "Warning",
            `CLP*${clp.claimId}`, "CLP04",
            "Balance Error",
            `Claim ${clp.claimId}: Billed ($${clp.billedAmount}) minus adjustments ($${clp.adjustments.reduce((a, c) => a + c.amount, 0).toFixed(2)}) does not equal paid amount ($${clp.paidAmount}). Possible remittance discrepancy.`
          ));
        }
      }
      return issues;
    },
  },

  // ── 834 Subscriber Indicator ─────────────────────────────────────────────
  {
    id: "INS-001",
    txTypes: ["834"],
    run(segments) {
      const issues: ValidationIssue[] = [];
      for (const seg of segments.filter((s) => s.id === "INS")) {
        const indicator = getEl(seg, 1);
        if (!["Y", "N"].includes(indicator)) {
          issues.push(issue(
            `INS-001-${seg.index}`, "Critical",
            "INS", "INS01",
            "Invalid Value",
            `INS01 (Subscriber Indicator) value '${indicator}' is invalid. Must be 'Y' (subscriber) or 'N' (dependent).`
          ));
        }
        const maintenanceCode = getEl(seg, 3);
        if (!maintenanceCode) {
          issues.push(issue(
            `INS-002-${seg.index}`, "Warning",
            "INS", "INS03",
            "Missing Element",
            "INS03 (Maintenance Type Code) is missing. Required for 834 enrollment transactions."
          ));
        }
      }
      return issues;
    },
  },

  // ── CLM05 Place of Service (837P) ─────────────────────────────────────────
  {
    id: "CLM-003",
    txTypes: ["837P"],
    run(segments) {
      const issues: ValidationIssue[] = [];
      for (const seg of segments.filter((s) => s.id === "CLM")) {
        const pos = getEl(seg, 5);
        if (!pos || pos.split(":")[0] === "") {
          issues.push(issue(
            `CLM-003-${seg.index}`, "Critical",
            `CLM*${getEl(seg, 1)}`, "CLM05",
            "Missing Element",
            `Claim ${getEl(seg, 1)}: CLM05 (Facility Type Code / Place of Service) is required for 837 Professional but is missing.`
          ));
        }
      }
      return issues;
    },
  },

  // ── Segment Count Check (SE) ──────────────────────────────────────────────
  {
    id: "SE-001",
    txTypes: "ALL",
    run(segments) {
      const se = segments.find((s) => s.id === "SE");
      const st = segments.find((s) => s.id === "ST");
      if (!se || !st) return [];

      const declaredCount = parseInt(getEl(se, 1));
      // Count segments from ST to SE inclusive
      const stIdx = segments.findIndex((s) => s.id === "ST");
      const seIdx = segments.findIndex((s) => s.id === "SE");
      const actualCount = seIdx - stIdx + 1;

      if (declaredCount !== actualCount) {
        return [issue(
          "SE-001", "Critical",
          "SE", "SE01",
          "Segment Count Error",
          `SE01 declares ${declaredCount} segments but actual count from ST to SE is ${actualCount}. File may be truncated or corrupted.`
        )];
      }
      return [];
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Validator Entry Point
// ─────────────────────────────────────────────────────────────────────────────
export function runValidation(parsed: ParsedEDI): ValidationIssue[] {
  const allIssues: ValidationIssue[] = [];
  const txType = parsed.fileInfo.type;

  for (const rule of rules) {
    if (rule.txTypes === "ALL" || rule.txTypes.includes(txType as TransactionType)) {
      try {
        const found = rule.run(parsed.rawSegments, parsed);
        allIssues.push(...found);
      } catch (e) {
        console.warn(`Rule ${rule.id} threw:`, e);
      }
    }
  }

  // Sort: Critical first, then Warning, then Info
  const order: Record<Severity, number> = { Critical: 0, Warning: 1, Info: 2 };
  allIssues.sort((a, b) => order[a.severity] - order[b.severity]);

  return allIssues;
}

export function getValidationSummary(issues: ValidationIssue[]) {
  return {
    critical: issues.filter((i) => i.severity === "Critical").length,
    warning: issues.filter((i) => i.severity === "Warning").length,
    info: issues.filter((i) => i.severity === "Info").length,
    total: issues.length,
    passed: issues.length === 0,
  };
}
