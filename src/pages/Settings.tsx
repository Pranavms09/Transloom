import { useState } from "react";
import { Layout } from "../components/Layout";
import { Settings as SettingsIcon, Moon, Download, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function Settings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [password, setPassword] = useState("");

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated successfully! (Mocked)");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password updated securely. (Mocked)");
    setPassword("");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure? This deletes ALL mock projects and TM data from this browser!",
      )
    ) {
      localStorage.clear();
      alert("Data cleared.");
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transloom_backup.json";
    a.click();
  };

  return (
    <Layout
      title="Settings"
      icon={<SettingsIcon className="w-5 h-5 text-blue-500" />}
    >
      <div className="max-w-4xl space-y-8 w-full">
        {/* Profile Settings */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Profile Settings</h2>
          <p className="text-sm text-gray-400 mb-4">
            Manage your public display name
          </p>
          <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full bg-transparent border border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-black font-semibold rounded-lg px-4 py-2 hover:bg-gray-200 transition"
            >
              Update Name
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Security</h2>
          <p className="text-sm text-gray-400 mb-4">Update your password</p>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-transparent border border-gray-700 rounded-lg px-4 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-500 transition"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* Appearance Settings */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Appearance</h2>
          <div className="flex items-center justify-between mt-4 max-w-md">
            <span className="text-sm font-medium text-gray-300">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="bg-gray-800 border border-gray-700 p-2 rounded-lg hover:bg-gray-700 transition"
            >
              <Moon className="text-slate-900 dark:text-slate-100 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm border-red-900/50 bg-red-950/10">
          <h2 className="text-lg font-bold text-red-500">Data Management</h2>
          <p className="text-sm text-gray-400 mb-4">
            Export or delete your local project data
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleExportData}
              className="bg-gray-800 border border-gray-700 text-slate-900 dark:text-slate-100 font-semibold rounded-lg px-4 py-2 hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export All Data
            </button>
            <button
              onClick={handleClearData}
              className="bg-red-600 text-slate-900 dark:text-slate-100 font-semibold rounded-lg px-4 py-2 hover:bg-red-500 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Local Data
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
