import { useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { PHINotice } from "../components/PHINotice";
import {
  UploadCloud, FileType, CheckCircle, Archive,
  AlertTriangle, ChevronRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { parseX12, TransactionType } from "../lib/x12Parser";
import { runValidation } from "../lib/validator";
import { useEDI } from "../contexts/EDIContext";
import JSZip from "jszip";

const TYPE_LABEL: Record<TransactionType | string, string> = {
  "837P": "837 Professional Claim",
  "837I": "837 Institutional Claim",
  "835": "835 Payment Remittance (ERA)",
  "834": "834 Benefit Enrollment",
  "UNKNOWN": "Unknown Transaction",
};
const TYPE_COLOR: Record<string, string> = {
  "837P": "text-blue-600 dark:text-blue-400",
  "837I": "text-indigo-600 dark:text-indigo-400",
  "835": "text-green-600 dark:text-green-400",
  "834": "text-purple-600 dark:text-purple-400",
  "UNKNOWN": "text-slate-500",
};

interface ProcessResult {
  fileName: string;
  type: string;
  size: string;
  segmentCount: number;
  errorCount: number;
}

export function UploadRoute() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBatch, setIsBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setParsedData, setBatchData } = useEDI();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    setError(null);
    setResult(null);
    setBatchResults([]);

    // Handle ZIP (batch)
    if (ext === "zip") {
      setIsBatch(true);
      setIsProcessing(true);
      try {
        const zip = new JSZip();
        const arrayBuffer = await file.arrayBuffer();
        const loaded = await zip.loadAsync(arrayBuffer);
        const ediFiles = Object.keys(loaded.files).filter((name) => {
          const e = name.split(".").pop()?.toLowerCase();
          return ["edi", "txt", "dat", "x12"].includes(e || "") && !loaded.files[name].dir;
        });

        if (ediFiles.length === 0) {
          setError("No valid EDI files found inside the ZIP archive.");
          setIsProcessing(false);
          return;
        }

        const batchFileObjects = [];
        const batchRes: ProcessResult[] = [];

        for (const name of ediFiles) {
          const text = await loaded.files[name].async("string");
          const parsed = parseX12(text, name);
          const issues = runValidation(parsed);
          batchFileObjects.push({ name, parsed, issues });
          batchRes.push({
            fileName: name,
            type: TYPE_LABEL[parsed.fileInfo.type] || parsed.fileInfo.type,
            size: parsed.fileInfo.size,
            segmentCount: parsed.fileInfo.segmentCount,
            errorCount: issues.filter((i) => i.severity === "Critical").length,
          });
        }

        setBatchData(batchFileObjects);
        setBatchResults(batchRes);
      } catch (e) {
        setError("Failed to process ZIP file: " + (e as Error).message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Single EDI file
    setIsBatch(false);
    if (!["edi", "txt", "dat", "x12"].includes(ext || "")) {
      setError("Invalid file type. Please upload .edi, .txt, .dat, .x12, or .zip files.");
      return;
    }

    setIsProcessing(true);
    try {
      const text = await readFileAsText(file);
      const parsed = parseX12(text, file.name);
      const issues = runValidation(parsed);
      setParsedData(parsed, issues);
      setResult({
        fileName: file.name,
        type: TYPE_LABEL[parsed.fileInfo.type] || parsed.fileInfo.type,
        size: parsed.fileInfo.size,
        segmentCount: parsed.fileInfo.segmentCount,
        errorCount: issues.filter((i) => i.severity === "Critical").length,
      });
    } catch (e) {
      setError("Failed to parse EDI file: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setBatchResults([]);
    setError(null);
    setIsBatch(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout title="Upload EDI File" icon={<UploadCloud className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <PHINotice />
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Secure Processing Gateway</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your X12 transaction files for instant parsing and HIPAA 5010 validation.
          </p>
        </div>

        {/* Drop Zone */}
        {!result && batchResults.length === 0 && !isProcessing && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".edi,.txt,.dat,.x12,.zip"
              onChange={handleFileInput}
            />
            <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Drag & Drop your EDI file here
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              or click to browse from your computer
            </p>
            <div className="flex items-center justify-center flex-wrap gap-3 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
              {[".EDI", ".X12", ".DAT", ".TXT"].map((ext) => (
                <span key={ext} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <FileType className="w-3 h-3" /> {ext}
                </span>
              ))}
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Archive className="w-3 h-3" /> .ZIP (Batch)
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-700 dark:text-red-400">Processing Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {isBatch ? "Analyzing Batch..." : "Parsing & Validating..."}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Running HIPAA 5010 validation rules</p>
          </div>
        )}

        {/* Single File Result */}
        {result && !isProcessing && (
          <div className="bg-white dark:bg-slate-800 border border-green-500/30 rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 flex items-center justify-center rounded-2xl flex-shrink-0">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">File Successfully Parsed</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 font-mono text-sm">{result.fileName}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Detected Type", value: result.type, extra: TYPE_COLOR[result.type] || "text-slate-900 dark:text-slate-100" },
                    { label: "Total Segments", value: result.segmentCount.toLocaleString(), extra: "text-slate-900 dark:text-slate-100" },
                    { label: "File Size", value: result.size, extra: "text-slate-900 dark:text-slate-100" },
                    {
                      label: "Critical Errors",
                      value: result.errorCount.toString(),
                      extra: result.errorCount > 0 ? "text-red-600 dark:text-red-400 font-bold" : "text-green-600 dark:text-green-400 font-bold",
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{item.label}</p>
                      <p className={`font-semibold text-sm ${item.extra}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => navigate("/validation")}
                    className="flex-1 min-w-[160px] bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" /> Run Full Validation
                  </button>
                  <button
                    onClick={() => navigate("/explorer/parsed")}
                    className="flex-1 min-w-[160px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold py-3 rounded-xl transition border border-gray-200 dark:border-slate-600"
                  >
                    Explore Structure
                  </button>
                  {(result.type.includes("835")) && (
                    <button onClick={() => navigate("/insights/835")} className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition">
                      View 835 Summary
                    </button>
                  )}
                  {(result.type.includes("834")) && (
                    <button onClick={() => navigate("/insights/834")} className="flex-1 min-w-[140px] bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl transition">
                      View 834 Members
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button onClick={reset} className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition mx-auto">
              <UploadCloud className="w-4 h-4" /> Upload another file
            </button>
          </div>
        )}

        {/* Batch Results */}
        {batchResults.length > 0 && !isProcessing && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
              <Archive className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Batch Processing Complete</h3>
                <p className="text-sm text-slate-500">{batchResults.length} files processed</p>
              </div>
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => navigate("/validation")}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
                >
                  View Validation
                </button>
                <button onClick={reset} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">File Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-center">Segments</th>
                  <th className="p-4 text-center">Critical Errors</th>
                  <th className="p-4">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {batchResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono text-sm text-slate-900 dark:text-slate-100">{r.fileName}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{r.type}</td>
                    <td className="p-4 text-center font-mono text-sm">{r.segmentCount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold font-mono text-sm ${r.errorCount > 0 ? "text-red-500" : "text-green-500"}`}>
                        {r.errorCount > 0 ? r.errorCount : "✓"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{r.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
