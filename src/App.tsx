import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { UploadRoute } from "./pages/Upload";
import { FileAnalysis } from "./pages/FileAnalysis";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";
import { History } from "./pages/History";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Core Workflow Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadRoute />} />
      <Route path="/analysis" element={<FileAnalysis />} />
      <Route path="/history" element={<History />} />
      <Route path="/ai" element={<AIAssistant />} />
      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
