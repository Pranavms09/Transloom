# ClaimLens – US Healthcare EDI Parser & Validator

ClaimLens is a high-performance, browser-based **HIPAA 5010 X12 EDI parser and validator**. It enables healthcare billing teams, clearinghouses, and developers to instantly parse complex EDI files, validate them against HIPAA 5010 rules, and visually explore the data—all without sending sensitive PHI to a backend server.

---

## 🚀 Key Features

- **100% Client-Side Processing**: Zero data leaves the browser. Parses and validates immediately using Web Workers and TypeScript.
- **Hierarchical Loop Parsing**: Automatically builds complex X12 nested loops (e.g., 2000A > 2000B > 2300) for easy visualization.
- **Auto-Detection**: Instantly identifies transaction types (837P, 837I, 835, 834) via ISA, GS, and ST segments.
- **Batch Processing**: Upload a `.zip` file containing hundreds of `.edi` files—ClaimLens processes them all simultaneously.
- **HIPAA 5010 Rules Engine**: Built-in logic checks for NPI validity (Luhn algorithm), claim balancing (Total Charges = sum of service lines), date formats, ZIP codes, and balancing segment counts (SE01).
- **AI-Powered Explanations**: Integrated OpenAI copilot to translate dense EDI segments and cryptic validation errors into plain English.
- **Robust Exporting**: Download parsed loop trees as JSON, validation errors as CSV, remittance claims as CSV, or generate a PDF report.

---

## 🛠 Supported X12 Transactions

ClaimLens currently supports deep parsing and intelligent summarization for the following X12 transactions:

1. **837 Professional (837P)** & **837 Institutional (837I)**
   - Extracts Claims, Service Lines (SV1/SV2).
   - Validates NPIs, ICD-10 presence, and charge balancing.
2. **835 Electronic Remittance Advice (ERA)**
   - Extracts Claim Level Payment (CLP) loops.
   - Summarizes total billed, total paid, adjustments (CAS), and patient responsibility.
3. **834 Benefit Enrollment**
   - Extracts Member loops (Loop 2000).
   - Summarizes Subscribers vs. Dependents, gender, relationships, and active/terminated status.

*(Note: Other X12 formats like 270/271 or 276/277 will be parsed into a generic structure, but lack transaction-specific insights pages).*

---

## 📂 Project Structure

The codebase is organized as a client-side React + TypeScript application built with Vite.

```
ClaimLens/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Layout.tsx         # Main app shell (Sidebar + Topbar)
│   │   └── theme-provider.tsx # Dark/Light mode context
│   │
│   ├── contexts/              # Global React State
│   │   ├── AuthContext.tsx    # Mocked Authentication state
│   │   └── EDIContext.tsx     # The core state holding the actively parsed file & batch results
│   │
│   ├── lib/                   # Core business logic (No React code here)
│   │   ├── x12Parser.ts       # 🧠 The X12 Tokenizer & Loop Builder
│   │   ├── validator.ts       # 🛡️ HIPAA 5010 Validation Engine
│   │   ├── openaiClient.ts    # AI Copilot integration + Rule-based fallback
│   │   └── exportUtils.ts     # JSON, CSV, and PDF generators
│   │
│   └── pages/                 # application views
│       ├── Upload.tsx         # Drag & drop zone, ZIP batch handling
│       ├── FileExplorer.tsx   # Visual tree, JSON view, Raw EDI viewer
│       ├── Validation.tsx     # Error data grid, severity filters
│       ├── Insights835.tsx    # 835-specific claim payment table
│       ├── Insights834.tsx    # 834-specific member enrollment list
│       └── AIAssistant.tsx    # Chat interface for EDI queries
│
├── package.json               # Dependencies (React, Tailwind, JSZip, JSPDF)
└── .env.local                 # (Optional) OpenAI and Firebase API keys
```

---

## 🛡️ HIPAA Validation Rules

| Rule ID | Check | Applies To |
|---------|-------|-----------|
| ISA-001/002 | ISA segment present, date format valid | All |
| ST-001 | ST segment present, valid transaction code | All |
| NM1-001/002 | NPI present and passes Luhn algorithm when qualifier=XX | 837 |
| CLM-001 | Total charges match sum of SV1/SV2 service lines | 837 |
| CLM-002 | At least one ICD-10 diagnosis code present | 837 |
| CLM-003 | Place of service (CLM05) present | 837P |
| DTP-001/002 | Date in D8 (CCYYMMDD) or RD8 format | All |
| N4-001 | ZIP code is 5 or 9 digits | All |
| SE-001 | Segment count in SE01 matches actual count | All |
| INS-001/002 | INS01 is Y/N, INS03 maintenance code present | 834 |
| CLP-001 | 835 payment reconciliation (billed - adj = paid) | 835 |

---

## 📥 Export Options

| Format | Where | Contents |
|--------|-------|---------|
| JSON | Validation, 835, 834 pages | Full parsed data or errors |
| CSV | Validation page | Error list |
| CSV | 835 page | CLP claims with adjustments |
| CSV | 834 page | Member enrollment list |
| PDF | Validation page | Browser-print error report |

---

## ⚙️ How It Works (Under the Hood)

1. **File Upload (`Upload.tsx`)**: 
   - Files are read into memory using the HTML5 `FileReader` API. 
   - If a `.zip` is uploaded, `JSZip` extracts it in-browser.
2. **Parsing (`x12Parser.ts`)**:
   - The parser reads the `ISA` segment to dynamically identity the delimiters (Asterisk `*`, Tilde `~`, Caret `^`, Colon `:`).
   - It tokenizes the raw text into `X12Segment` objects.
   - Based on the identified transaction type (from `ST01`), it runs a specialized loop builder to map linear segments into a nested `X12Loop` tree hierarchy.
3. **Validation (`validator.ts`)**:
   - The parsed tree is passed through a suite of `ValidationRule` functions. 
   - It checks cross-segment logic (e.g., "Does `CLM02` equal the sum of `SV102` across all child loops?").
   - It returns an array of structured `ValidationIssue` objects (Critical, Warning, Info).
4. **State Management (`EDIContext.tsx`)**:
   - The parser and validation results are placed in `EDIContext`.
   - All other pages (`Validation.tsx`, `Insights*.tsx`, `FileExplorer.tsx`) instantly rerender reflecting the new data.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Install dependencies
```bash
npm install
```

2. Start the development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🤖 Configuring the AI Assistant

ClaimLens includes an AI Assistant designed to explain EDI errors. 
By default, the assistant uses a built-in **Rule-Based Fallback** (requires no API keys) that can answer common questions about CLM, NM1, NPI, ISA, etc.

To enable full OpenAI GPT-4o capabilities:

1. Create a `.env.local` file in the root directory.
2. Add your OpenAI API key:
   ```env
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Restart the dev server (`npm run dev`).

The system injects the currently parsed EDI file, its segment counts, and validation errors directly into the AI's system prompt, allowing it to answer deep contextual questions about *your specific file*.
