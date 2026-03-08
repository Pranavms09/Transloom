import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  BrainCircuit,
} from "lucide-react";

interface Step {
  label: string;
  detail: string;
  durationMs: number;
}

const STEPS: Step[] = [
  { label: "Upload received",            detail: "Securely transmitted to server",          durationMs: 600  },
  { label: "Analyzing EDI file with AI", detail: "Gemini 2.5 Flash reading segments",       durationMs: 1000 },
  { label: "Parsing X12 segments",       detail: "ISA, GS, ST loops extracted",             durationMs: 1100 },
  { label: "Detecting validation errors",detail: "Running HIPAA 5010 compliance checks",    durationMs: 1000 },
  { label: "Generating readable summary",detail: "Translating codes to plain language",     durationMs: 900  },
  { label: "Preparing dashboard",        detail: "Structuring data for display",            durationMs: 700  },
];

interface Props {
  fileName: string;
  isDone: boolean;
  onFadeComplete?: () => void;
}

export function ProcessingPipeline({ fileName, isDone, onFadeComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fading, setFading] = useState(false);

  // Tick through all steps EXCEPT the last one (hold there until backend responds)
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    // Only advance up to STEPS.length - 1 so we never show "100%" prematurely
    const stepsToAnimate = STEPS.length - 1;
    let elapsed = 0;
    for (let i = 0; i < stepsToAnimate; i++) {
      elapsed += STEPS[i].durationMs;
      const step = i;
      const t = setTimeout(() => {
        setCurrentStep(step + 1);
      }, elapsed);
      timeouts.push(t);
    }
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // When the backend finishes, snap the last step to complete then fade out
  useEffect(() => {
    if (!isDone) return;
    // Immediately complete all steps
    setCurrentStep(STEPS.length);
    // Brief pause to show green checkmarks, then fade
    const t1 = setTimeout(() => {
      setFading(true);
      const t2 = setTimeout(() => {
        onFadeComplete?.();
      }, 600);
      return () => clearTimeout(t2);
    }, 700);
    return () => clearTimeout(t1);
  }, [isDone]);

  // Progress caps at (STEPS.length-1)/STEPS.length until isDone snaps it to 100
  const progress = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 transition-opacity duration-700 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <BrainCircuit className={`w-8 h-8 text-blue-400 ${isDone ? "" : "animate-pulse"}`} />
            </div>
            {!isDone && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Processing EDI File</h2>
          <p className="text-slate-400 text-sm">
            AI is analyzing your healthcare transaction
          </p>
          {fileName && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-mono truncate max-w-[200px]">{fileName}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progress</span>
            <span className="text-slate-300 font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, idx) => {
            const isComplete = currentStep > idx;
            const isActive   = currentStep === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                  isComplete
                    ? "bg-green-900/10 border-green-700/20"
                    : isActive
                    ? "bg-blue-900/20 border-blue-700/30"
                    : "bg-slate-800/40 border-slate-700/20"
                }`}
              >
                {/* Icon */}
                <div className="shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 transition-all duration-300" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors duration-300 ${
                    isComplete ? "text-green-400" : isActive ? "text-blue-300" : "text-slate-500"
                  }`}>
                    {step.label}
                  </p>
                  {(isActive || isComplete) && (
                    <p className="text-xs text-slate-500 mt-0.5 transition-all duration-300">
                      {step.detail}
                    </p>
                  )}
                </div>

                {/* Active dots */}
                {isActive && (
                  <div className="flex gap-1 shrink-0">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by Gemini 2.5 Flash · HIPAA 5010 compliant processing
        </p>
      </div>
    </div>
  );
}
