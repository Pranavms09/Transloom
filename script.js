// Initialize Icons
lucide.createIcons();

// Setup Theme toggle
const toggleThemeBtn = document.getElementById("toggle-theme");
const themeIcon = document.getElementById("theme-icon");

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  if (document.body.classList.contains("dark")) {
    themeIcon.setAttribute("data-lucide", "sun");
    themeIcon.className = "text-yellow-400";
  } else {
    themeIcon.setAttribute("data-lucide", "moon");
    themeIcon.className = "text-gray-500";
  }
  lucide.createIcons();
});

// Sidebar Toggle function
const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const sidebar = document.getElementById("sidebar");
const sidebarLogo = document.getElementById("sidebar-logo");
const sidebarTexts = document.querySelectorAll(".sidebar-text");
const sidebarIcon = document.getElementById("sidebar-icon");

let isSidebarOpen = true;

toggleSidebarBtn.addEventListener("click", () => {
  isSidebarOpen = !isSidebarOpen;
  if (isSidebarOpen) {
    sidebar.classList.remove("w-20");
    sidebar.classList.add("w-64");
    sidebarLogo.style.display = "flex";
    sidebarTexts.forEach((el) => (el.style.display = "inline"));
    sidebarIcon.setAttribute("data-lucide", "x");
  } else {
    sidebar.classList.remove("w-64");
    sidebar.classList.add("w-20");
    sidebarLogo.style.display = "none";
    sidebarTexts.forEach((el) => (el.style.display = "none"));
    sidebarIcon.setAttribute("data-lucide", "menu");
  }
  lucide.createIcons();
  // redraw charts to fit
  setTimeout(() => {
    pieChart.resize();
    barChart.resize();
  }, 300);
});

// Chart Data
const chartColors = ["#65c2a0", "#5555ff", "#10b981"];

// Pie Chart setup
const ctxPie = document.getElementById("pieChart").getContext("2d");
const pieChart = new Chart(ctxPie, {
  type: "doughnut",
  data: {
    labels: ["In Review", "Processing", "Completed"],
    datasets: [
      {
        data: [1, 0, 1], // Values extracted from mock-data
        backgroundColor: chartColors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "right",
        labels: { color: "var(--muted-foreground)" },
      },
    },
  },
});

// Bar Chart TM Leverage
const ctxBar = document.getElementById("barChart").getContext("2d");
const barChart = new Chart(ctxBar, {
  type: "bar",
  data: {
    labels: ["Exact Matches", "Fuzzy Matches", "New Segments"],
    datasets: [
      {
        label: "Percentage %",
        data: [45, 35, 20],
        backgroundColor: "#5555ff", // Accent color
        borderRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: "var(--muted-foreground)" } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(150, 150, 150, 0.2)" },
        ticks: { color: "gray" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "gray" },
      },
    },
  },
});
