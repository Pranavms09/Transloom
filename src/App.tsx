import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Projects } from "./pages/Projects";
import { Workspace } from "./pages/Workspace";
import { Memory } from "./pages/Memory";
import { Glossary } from "./pages/Glossary";
import { Validation } from "./pages/Validation";
import { Review } from "./pages/Review";
import { Settings } from "./pages/Settings";
import { Billing } from "./pages/Billing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/new" element={<Projects />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/glossary" element={<Glossary />} />
      <Route path="/validation" element={<Validation />} />
      <Route path="/review" element={<Review />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/billing" element={<Billing />} />
      {/* Additional routes will be added here during page conversions */}
    </Routes>
  );
}

export default App;
