// ─────────────────────────────────────────────────────────────────────────────
// Export Utilities: JSON, CSV, PDF (print-based)
// ─────────────────────────────────────────────────────────────────────────────

import { ValidationIssue } from "./validator";
import { ParsedEDI, CLP835, Member834, Claim837 } from "./x12Parser";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── JSON Export ───────────────────────────────────────────────────────────────
export function exportJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, filename);
}

// ── CSV Export ────────────────────────────────────────────────────────────────
function csvRow(fields: string[]): string {
  return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",");
}

export function exportValidationCSV(issues: ValidationIssue[], filename: string) {
  const header = csvRow(["ID", "Severity", "Segment", "Position", "Type", "Description"]);
  const rows = issues.map((i) =>
    csvRow([i.id, i.severity, i.segment, i.position, i.type, i.description])
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

export function export835CSV(clpLoops: CLP835[], filename: string) {
  const header = csvRow([
    "Claim ID", "Status", "Billed Amount", "Paid Amount",
    "Patient Responsibility", "Claim Filing Indicator",
    "Adjustment Group", "Adjustment Reason", "Adjustment Amount",
  ]);
  const rows: string[] = [];
  for (const clp of clpLoops) {
    if (clp.adjustments.length === 0) {
      rows.push(csvRow([
        clp.claimId, clp.statusCode,
        clp.billedAmount.toFixed(2), clp.paidAmount.toFixed(2),
        clp.patientResponsibility.toFixed(2), clp.claimFilingIndicator,
        "", "", "",
      ]));
    } else {
      for (const adj of clp.adjustments) {
        rows.push(csvRow([
          clp.claimId, clp.statusCode,
          clp.billedAmount.toFixed(2), clp.paidAmount.toFixed(2),
          clp.patientResponsibility.toFixed(2), clp.claimFilingIndicator,
          adj.groupCode, adj.reasonCode, adj.amount.toFixed(2),
        ]));
      }
    }
  }
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

export function export834CSV(members: Member834[], filename: string) {
  const header = csvRow([
    "Member ID", "Last Name", "First Name",
    "Subscriber Indicator", "Relationship",
    "Birth Date", "Gender", "Effective Date", "Term Date",
  ]);
  const rows = members.map((m) =>
    csvRow([
      m.memberId, m.lastName, m.firstName,
      m.subscriberIndicator === "Y" ? "Subscriber" : "Dependent",
      m.relationship, m.birthDate, m.gender,
      m.effectiveDate, m.termDate || "Active",
    ])
  );
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

export function export837CSV(claims: Claim837[], filename: string) {
  const header = csvRow([
    "Claim ID", "Total Charges", "Place of Service",
    "Billing NPI", "Billing Name", "Patient Name",
    "Member ID", "Diagnosis Codes",
    "Procedure Code", "Charge Amount", "Units", "Service Date",
  ]);
  const rows: string[] = [];
  for (const claim of claims) {
    if (claim.serviceLines.length === 0) {
      rows.push(csvRow([
        claim.claimId, claim.totalCharges.toFixed(2), claim.placeOfService,
        claim.billingNpi, claim.billingName, claim.patientName,
        claim.subscriberMemberId, claim.diagnosisCodes.join(";"),
        "", "", "", "",
      ]));
    } else {
      for (const svc of claim.serviceLines) {
        rows.push(csvRow([
          claim.claimId, claim.totalCharges.toFixed(2), claim.placeOfService,
          claim.billingNpi, claim.billingName, claim.patientName,
          claim.subscriberMemberId, claim.diagnosisCodes.join(";"),
          svc.procedureCode, svc.chargeAmount.toFixed(2),
          String(svc.units), svc.serviceDate,
        ]));
      }
    }
  }
  const csv = [header, ...rows].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

// ── PDF Error Report (browser print) ─────────────────────────────────────────
export function exportPDFReport(
  issues: ValidationIssue[],
  fileInfo: ParsedEDI["fileInfo"]
) {
  const styles = `
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 24px; }
    h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #475569; margin-bottom: 20px; }
    .meta { display: flex; gap: 24px; flex-wrap: wrap; background: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 11px; }
    .meta div b { text-transform: uppercase; color: #64748b; font-size: 10px; display: block; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1e293b; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; vertical-align: top; }
    .critical { color: #dc2626; font-weight: bold; }
    .warning { color: #d97706; font-weight: bold; }
    .info { color: #2563eb; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 10px; color: #94a3b8; }
  `;

  const meta = `
    <div class="meta">
      <div><b>File</b>${fileInfo.name}</div>
      <div><b>Type</b>${fileInfo.type}</div>
      <div><b>Segments</b>${fileInfo.segmentCount}</div>
      <div><b>Sender</b>${fileInfo.senderId}</div>
      <div><b>Receiver</b>${fileInfo.receiverId}</div>
      <div><b>Version</b>${fileInfo.version}</div>
    </div>
  `;

  const rows = issues.map((i) => `
    <tr>
      <td class="${i.severity.toLowerCase()}">${i.severity}</td>
      <td style="font-family:monospace">${i.segment}</td>
      <td style="font-family:monospace">${i.position}</td>
      <td>${i.type}</td>
      <td>${i.description}</td>
    </tr>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>ClaimLens Validation Report</title>
    <style>${styles}</style></head>
    <body>
    <h1>ClaimLens HIPAA Validation Report</h1>
    <div class="subtitle">Generated ${new Date().toLocaleString()} · ${issues.length} issue(s) found</div>
    ${meta}
    <table>
      <thead><tr><th>Severity</th><th>Segment</th><th>Position</th><th>Error Type</th><th>Description</th></tr></thead>
      <tbody>${rows || "<tr><td colspan='5' style='text-align:center;padding:20px;color:#22c55e;'>✓ No validation errors found</td></tr>"}</tbody>
    </table>
    <div class="footer">ClaimLens · HIPAA 5010 Validation Tool · ${fileInfo.name}</div>
    </body></html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }
}
