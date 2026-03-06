import { useEffect, useRef } from "react";
import { Layout } from "../components/Layout";
import { LayoutDashboard } from "lucide-react";
import Chart from "chart.js/auto";

export function Dashboard() {
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartInstance = useRef<Chart | null>(null);
  const barChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Initialize Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      const ctx = pieChartRef.current.getContext("2d");
      if (ctx) {
        pieChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["In Progress", "In Review", "Completed", "Archived"],
            datasets: [
              {
                data: [4, 2, 8, 3],
                backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#6b7280"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "right", labels: { color: "#a1a1aa" } },
            },
            cutout: "70%",
          },
        });
      }
    }

    // Initialize Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) barChartInstance.current.destroy();
      const ctx = barChartRef.current.getContext("2d");
      if (ctx) {
        barChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                label: "100% Matches",
                data: [120, 150, 180, 90, 200, 50, 40],
                backgroundColor: "#10b981",
              },
              {
                label: "Fuzzy Matches",
                data: [300, 250, 400, 200, 350, 100, 80],
                backgroundColor: "#f59e0b",
              },
              {
                label: "New Words",
                data: [500, 600, 450, 800, 400, 200, 150],
                backgroundColor: "#3b82f6",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { stacked: true, grid: { display: false } },
              y: { stacked: true, grid: { color: "#27272a" } },
            },
            plugins: {
              legend: { position: "bottom", labels: { color: "#a1a1aa" } },
            },
          },
        });
      }
    }

    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, []);

  return (
    <Layout title="Dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-400">
            Here's an overview of your AI Translation Studio operations.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400">
              Total Projects
            </h3>
            <p className="text-3xl font-bold mt-2">12</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400">
              Segments Translated
            </h3>
            <p className="text-3xl font-bold mt-2 text-blue-500">14,392</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400">TM Usage Rate</h3>
            <p className="text-3xl font-bold mt-2 text-green-500">68%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-400">
              Words Processed
            </h3>
            <p className="text-3xl font-bold mt-2">128.5k</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-1">Project Status</h3>
            <p className="text-sm text-gray-400 mb-4">
              Current distribution of documents
            </p>
            <div style={{ height: "300px", position: "relative" }}>
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-1">
              Translation Memory Leverage
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Historical match distribution
            </p>
            <div style={{ height: "300px", position: "relative" }}>
              <canvas ref={barChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
