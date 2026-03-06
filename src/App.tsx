import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { UploadRoute } from "./pages/Upload";
import { Validation } from "./pages/Validation";
import { Settings } from "./pages/Settings";
import { FileExplorer } from "./pages/FileExplorer";
import { Insights835 } from "./pages/Insights835";
import { Insights834 } from "./pages/Insights834";
import { AIAssistant } from "./pages/AIAssistant";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ClaimLens Protected Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadRoute />} />

      {/* Explorer */}
      <Route path="/explorer/parsed" element={<FileExplorer />} />
      <Route path="/explorer/tree" element={<FileExplorer />} />

      {/* Validation */}
      <Route path="/validation" element={<Validation />} />
      <Route path="/validation/errors" element={<Validation />} />
      <Route path="/validation/suggestions" element={<Validation />} />

      {/* Insights */}
      <Route path="/insights/837" element={<Navigate to="/dashboard" />} />
      <Route path="/insights/835" element={<Insights835 />} />
      <Route path="/insights/834" element={<Insights834 />} />

      {/* AI */}
      <Route path="/ai/explain" element={<AIAssistant />} />
      <Route path="/ai/ask" element={<AIAssistant />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
