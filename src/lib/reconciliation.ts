import { ParsedEDI } from "./x12Parser";
import crcMap from "./carcdesc.json";

export interface ReconciledClaim {
  claimId: string;
  patientName: string;
  billedAmount: number;
  paidAmount: number;
  difference: number;
  adjustments: { code: string; desc: string; amount: number }[];
  status: "Matched" | "Paid in Full" | "Partial Payment" | "Denied" | "Unmatched 835" | "Unmatched 837";
}

export function reconcileClaims(parsedFiles: ParsedEDI[]): ReconciledClaim[] {
  // Aggregate all 837 claims
  const claims837 = new Map<string, any>();
  
  // Aggregate all 835 payments
  const payments835 = new Map<string, any>();

  for (const file of parsedFiles) {
    if (file.fileInfo.type === "837P" || file.fileInfo.type === "837I") {
      for (const claim of file.claimLoops || []) {
        // Patient name from loop 2010BA or subscriber
        const patientName = claim.patientName || "Unknown";
        claims837.set(claim.claimId, {
          claimId: claim.claimId,
          patientName: patientName || "Unknown",
          billedAmount: claim.totalCharges,
        });
      }
    } else if (file.fileInfo.type === "835") {
      for (const clp of file.clpLoops || []) {
        payments835.set(clp.claimId, clp);
      }
    }
  }

  const results: ReconciledClaim[] = [];
  const processed835 = new Set<string>();

  // Match 837 to 835
  for (const [claimId, billedClaim] of claims837.entries()) {
    const payment = payments835.get(claimId);
    if (!payment) {
      results.push({
        claimId,
        patientName: billedClaim.patientName,
        billedAmount: billedClaim.billedAmount,
        paidAmount: 0,
        difference: billedClaim.billedAmount,
        adjustments: [],
        status: "Unmatched 837",
      });
      continue;
    }

    processed835.add(claimId);
    
    const diff = billedClaim.billedAmount - payment.paidAmount;
    
    // @ts-ignore
    const adjs = payment.adjustments.map(a => ({
      code: `${a.groupCode}/${a.reasonCode}`,
      // @ts-ignore
      desc: crcMap[`${a.groupCode}${a.reasonCode}`] || crcMap[a.reasonCode] || "Unknown Adjustment",
      amount: a.amount
    }));

    let status: ReconciledClaim["status"] = "Matched";
    if (["4", "4X"].includes(payment.statusCode) || payment.statusCode.startsWith("D")) {
      status = "Denied";
    } else if (diff === 0) {
      status = "Paid in Full";
    } else {
      status = "Partial Payment";
    }

    results.push({
      claimId,
      patientName: billedClaim.patientName,
      billedAmount: billedClaim.billedAmount,
      paidAmount: payment.paidAmount,
      difference: diff,
      adjustments: adjs,
      status,
    });
  }

  // Find 835s that had no 837 match
  for (const [claimId, payment] of payments835.entries()) {
    if (!processed835.has(claimId)) {
       // @ts-ignore
      const adjs = payment.adjustments.map(a => ({
        code: `${a.groupCode}/${a.reasonCode}`,
        // @ts-ignore
        desc: crcMap[`${a.groupCode}${a.reasonCode}`] || crcMap[a.reasonCode] || "Unknown Adjustment",
        amount: a.amount
      }));

      let status: ReconciledClaim["status"] = "Unmatched 835";
      if (["4", "4X"].includes(payment.statusCode) || payment.statusCode.startsWith("D")) {
        status = "Denied";
      }

      results.push({
        claimId,
        patientName: "Unknown (Missing 837)",
        billedAmount: payment.billedAmount, // Use 835 billed amount as fallback
        paidAmount: payment.paidAmount,
        difference: payment.billedAmount - payment.paidAmount,
        adjustments: adjs,
        status,
      });
    }
  }

  return results.sort((a, b) => b.billedAmount - a.billedAmount);
}
