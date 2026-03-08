import { ShieldCheck } from "lucide-react";

export function PHINotice() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-4 mb-6 shadow-sm">
      <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-2 flex-shrink-0 mt-0.5">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-300" />
      </div>
      <div>
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
          100% Local Processing & PHI Security
        </h4>
        <p className="text-blue-700 dark:text-blue-300 text-xs mt-1 leading-relaxed">
          All EDI parsing and HIPAA 5010 validation happens locally in your browser.
          No Protected Health Information (PHI) is ever transmitted to or stored on external servers,
          ensuring complete data privacy and HIPAA compliance.
        </p>
      </div>
    </div>
  );
}
