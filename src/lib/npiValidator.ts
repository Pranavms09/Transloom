export interface NPIValidationResult {
  npi: string;
  valid: boolean;
  providerName?: string;
  providerType?: "Individual" | "Organization";
  status?: "Active" | "Inactive";
  error?: string;
  corsBlocked?: boolean;
}

/**
 * Validates an NPI against the official CMS NPI Registry API.
 * 
 * NOTE: The CMS API does not support CORS. Browsers usually block this 
 * when called from a client-side origin (like localhost:5173). 
 * We use `fetch` but gracefully handle the `TypeError: Failed to fetch` 
 * that happens when CORS blocks the request, so the app doesn't crash.
 */
export async function validateNPIFromCMS(npi: string): Promise<NPIValidationResult> {
  // Ensure NPI is 10 digits
  if (!/^\d{10}$/.test(npi)) {
    return { npi, valid: false, error: "Must be 10 digits" };
  }

  const result: NPIValidationResult = { npi, valid: false };

  try {
    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`;
    
    // We send a GET request.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      result.error = `HTTP Error ${response.status}`;
      return result;
    }

    const data = await response.json();
    
    // The CMS API returns { result_count: 0 } if nothing is found
    if (data.result_count === 0 || !data.results || data.results.length === 0) {
      result.error = "NPI not found in registry";
      return result;
    }

    const provider = data.results[0];
    const basic = provider.basic;

    result.valid = true;
    result.status = basic.status === "A" ? "Active" : "Inactive";
    result.providerType = provider.enumeration_type === "NPI-1" ? "Individual" : "Organization";

    if (result.providerType === "Individual") {
      result.providerName = `${basic.first_name} ${basic.last_name}`;
    } else {
      result.providerName = basic.organization_name;
    }

    return result;
    
  } catch (error: any) {
    // If it's a TypeError, it's highly likely CORS blocked the frontend fetch.
    console.warn(`CMS API Fetch failed for ${npi}. Likely a CORS issue.`, error);
    
    return {
      npi,
      valid: true, // We assume it's valid structurally (Luhn pass is handled in the rule engine)
      corsBlocked: true,
      error: "CORS restriction blocked direct backend API call."
    };
  }
}
