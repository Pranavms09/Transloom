import { useMemo } from "react";
import { useEDI } from "../contexts/EDIContext";

export interface DashboardMetrics {
  totalProcessed: number;
  validTransactions: number;
  filesWithErrors: number;
  totalValidationErrors: number;
  errorBreakdown: { label: string; count: number; percent: number; color: string }[];
  fileTypeDistribution: { label: string; count: number; percent: string; color: string }[];
  recentActivity: {
    id: string;
    name: string;
    type: string;
    status: "Validated" | "Warnings" | "Critical";
    errors: number;
    date: string;
  }[];
  isLoading: boolean;
}

const ERROR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-teal-500",
];

const TYPE_COLORS: Record<string, string> = {
  "837 Professional": "bg-blue-500",
  "837 Institutional": "bg-blue-600",
  "835 Payment": "bg-green-500",
  "834 Enrollment": "bg-purple-500",
  "277 Claim Status": "bg-slate-500",
  "999 Acknowledgment": "bg-slate-400",
};

export function useDashboardData(): DashboardMetrics {
  const { history, historyLoading } = useEDI();

  const metrics = useMemo(() => {
    let totalProcessed = history.length;
    let validTransactions = 0;
    let filesWithErrors = 0;
    let totalValidationErrors = 0;

    const errorCounts: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};

    const recentActivity = history.slice(0, 5).map((entry) => {
      const type = entry.analysis.transactionOverview?.transactionType || "Unknown Type";
      const errorCount = entry.analysis.errors?.length || 0;
      let status: "Validated" | "Warnings" | "Critical" = "Validated";

      if (errorCount > 0) {
        filesWithErrors++;
        totalValidationErrors += errorCount;
        const hasCritical = entry.analysis.errors?.some((e) => e.severity === "Critical");
        status = hasCritical ? "Critical" : "Warnings";

        // Aggregate error types
        entry.analysis.errors?.forEach((err) => {
          const desc = err.description || "Unknown Error";
          errorCounts[desc] = (errorCounts[desc] || 0) + 1;
        });
      } else {
        validTransactions++;
      }

      // Aggregate file types
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;

      // Extract time roughly
      const dateObj = new Date(entry.uploadedAt);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const timeStr = isToday
        ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : dateObj.toLocaleDateString();

      return {
        id: entry.id,
        name: entry.fileName,
        type,
        status,
        errors: errorCount,
        date: timeStr,
      };
    });

    // We process the rest of the history to ensure global metrics are accurate
    history.slice(5).forEach((entry) => {
      const type = entry.analysis.transactionOverview?.transactionType || "Unknown Type";
      const errorCount = entry.analysis.errors?.length || 0;

      if (errorCount > 0) {
        filesWithErrors++;
        totalValidationErrors += errorCount;
        entry.analysis.errors?.forEach((err) => {
          const desc = err.description || "Unknown Error";
          errorCounts[desc] = (errorCounts[desc] || 0) + 1;
        });
      } else {
        validTransactions++;
      }
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    // Format error breakdown
    const errorBreakdown = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5
      .map(([label, count], index) => ({
        label,
        count,
        percent: totalValidationErrors ? Math.round((count / totalValidationErrors) * 100) : 0,
        color: ERROR_COLORS[index % ERROR_COLORS.length],
      }));

    // Format file type distribution
    const fileTypeDistribution = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        label,
        count,
        percent: totalProcessed ? Math.round((count / totalProcessed) * 100) + "%" : "0%",
        color: TYPE_COLORS[label] || "bg-slate-400",
      }));

    return {
      totalProcessed,
      validTransactions,
      filesWithErrors,
      totalValidationErrors,
      errorBreakdown,
      fileTypeDistribution,
      recentActivity,
      isLoading: historyLoading,
    };
  }, [history, historyLoading]);

  return metrics;
}
