// Mocked dataset of valid CPT/HCPCS procedure codes.
// A real database contains ~10,000 HCPCS/CPT codes.

const CPT_CODES = new Set([
  // E&M Visits
  "99213", "99214", "99215", "99203", "99204", "99284", "99285",
  // Preventative
  "99395", "99396", "99385",
  // Procedures / Surgery
  "10060", "12001", "45378", "43239", "27447",
  // Radiology
  "71045", "71046", "70450", "74177", "73221",
  // Labs
  "80053", "80061", "85025", "83036", "81002",
  // HCPCS specific
  "J9047", "J1745", "A0427", "A0425", "G0439", "G0438"
]);

/**
 * Validates whether a CPT or HCPCS code exists.
 */
export function validateCPT(code: string): boolean {
  if (!code) return false;
  const cleanCode = code.toUpperCase().trim();
  return CPT_CODES.has(cleanCode);
}
