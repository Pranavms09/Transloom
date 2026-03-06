import { useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { UploadCloud, FileType, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function UploadRoute() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    type: string;
    size: string;
    segments: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (uploadedFile: File) => {
    const ext = uploadedFile.name.split(".").pop()?.toLowerCase();
    if (!["edi", "txt", "dat", "x12"].includes(ext || "")) {
      alert(
        "Invalid file type. Please upload .edi, .txt, .dat, or .x12 files.",
      );
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    // Mock processing delay and result
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        type:
          Math.random() > 0.5
            ? "837 Professional Claim"
            : "835 Payment Remittance",
        size: (uploadedFile.size / 1024).toFixed(2) + " KB",
        segments: Math.floor(Math.random() * 500) + 50,
      });
    }, 1500);
  };

  return (
    <Layout
      title="Upload EDI File"
      icon={<UploadCloud className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Secure Processing Gateway
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your X12 transaction files for instant parsing and HIPAA
            validation.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200",
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-100 dark:bg-slate-100 dark:bg-slate-800/50 bg-white dark:bg-slate-100 dark:bg-slate-800",
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".edi,.txt,.dat,.x12"
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

            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <FileType className="w-3 h-3" /> .EDI
              </span>
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <FileType className="w-3 h-3" /> .X12
              </span>
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <FileType className="w-3 h-3" /> .DAT
              </span>
              <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <FileType className="w-3 h-3" /> .TXT
              </span>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white dark:bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-2xl p-12 text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Analyzing Structure...
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Connecting to parsing engine</p>
          </div>
        )}

        {/* Results State */}
        {result && !isProcessing && (
          <div className="bg-white dark:bg-slate-100 dark:bg-slate-800 border border-green-500/30 rounded-2xl p-8 shadow-sm dark:shadow-none shadow-green-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 bg-green-500/20 text-green-500 flex items-center justify-center rounded-2xl flex-shrink-0">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  File Successfully Parsed
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">{file?.name}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Detected Type
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">{result.type}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Total Segments
                    </p>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold">
                      {result.segments.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-300 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                      File Size
                    </p>
                    <p className="text-slate-900 dark:text-slate-100 font-semibold">{result.size}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate("/validation")}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-sm dark:shadow-none shadow-blue-600/20"
                  >
                    Run Full Validation
                  </button>
                  <button
                    onClick={() => navigate("/explorer/parsed")}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold py-3 rounded-xl transition border border-gray-300 dark:border-slate-700"
                  >
                    Explore Structure
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 transition mx-auto"
            >
              <UploadCloud className="w-4 h-4" /> Upload another file
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
