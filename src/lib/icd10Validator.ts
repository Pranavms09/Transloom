// Mocked database of valid ICD-10 codes for validation
// In a real application, this would be a much larger dictionary (e.g., 70,000+ codes)
// For client-side performance in this MVP, we use a curated list of common codes.

const ICD10_CODES = new Set([
  // Diabetes
  "E119", "E1165", "E11649", "E1121", "E1122", "E109",
  // Hypertension/Heart
  "I10", "I119", "I509", "I4891",
  // Respiratory
  "J189", "J449", "J45909", "J0190", "J209",
  // Symptoms
  "R079", "R05", "R509", "R104", "R51",
  // Musculoskeletal
  "M545", "M542", "M25561", "M25562",
  // Covid/Infections
  "U071", "A419",
  // Preventive/Exams
  "Z0000", "Z00129", "Z1231"
]);

/**
 * Validates whether an ICD-10 code exists in the dictionary.
 * (Strips decimals if present, X12 HI segment usually omits decimals).
 */
export function validateICD10(code: string): boolean {
  if (!code) return false;
  
  // X12 ICD-10 codes in the HI segment shouldn't have decimals, but just in case:
  const cleanCode = code.replace(/\./g, "").toUpperCase().trim();
  
  // For the sake of the MVP, if it looks like a valid ICD-10 format 
  // (Letter followed by 2 numbers, optionally more chars) and isn't in our tiny mock list,
  // we still might want to let it pass if we don't strictly enforce our tiny dictionary,
  // but the prompt asks to return errors if not in the dataset.
  // We will enforce the exact set for demonstration purposes.
  return ICD10_CODES.has(cleanCode);
}
