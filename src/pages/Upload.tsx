import { useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { PHINotice } from "../components/PHINotice";
import {
  UploadCloud, FileType, AlertTriangle, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useEDI } from "../contexts/EDIContext";

export function UploadRoute() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setAIAnalysis } = useEDI();

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    setError(null);

    // Single EDI file
    if (!["edi", "txt", "dat", "x12"].includes(ext || "")) {
      setError("Invalid file type. Please upload .edi, .txt, .dat, or .x12 files.");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("ediFile", file);

      const response = await fetch("/api/analyze-edi", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const aiData = await response.json();
      setAIAnalysis(aiData);
      
      // Navigate to File Analysis straight away
      navigate("/analysis");
    } catch (e) {
      setError("Failed to process EDI file via AI: " + (e as Error).message);
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout title="Upload EDI File" icon={<UploadCloud className="w-5 h-5 text-blue-500" />}>
      <div className="max-w-4xl mx-auto w-full space-y-8 mt-12">
        <PHINotice />
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Secure Processing Gateway</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your X12 transaction files for instant parsing and HIPAA 5010 validation.
          </p>
        </div>

        {/* Drop Zone */}
        {!isProcessing && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-3xl p-20 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02]",
              isDragging
                ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                : "border-gray-300 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800 shadow-sm"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".edi,.txt,.dat,.x12"
              onChange={handleFileInput}
            />
            <div className="w-24 h-24 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
              <UploadCloud className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              Drag & Drop your EDI file here
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              or click to browse from your computer
            </p>
            <div className="flex items-center justify-center flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              {[".EDI", ".X12", ".DAT", ".TXT"].map((ext) => (
                <span key={ext} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full">
                  <FileType className="w-4 h-4" /> {ext}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-800 dark:text-red-400 text-lg">Processing Error</p>
              <p className="text-red-600 dark:text-red-300 mt-1 font-medium">{error}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-600 p-2 bg-red-100 dark:bg-red-900/40 rounded-full transition"><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl p-16 text-center shadow-lg animate-in zoom-in-95">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-sm" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Parsing & Validating...
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Running HIPAA 5010 validation rules</p>
          </div>
        )}

      </div>
    </Layout>
  );
}
