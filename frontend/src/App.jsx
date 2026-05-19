import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import BankDashboard from "./components/BankDashboard";
import AttackSimulator from "./components/AttackSimulator";
import { initSecurityProfiler } from "./utils/securityProfiler";

function App() {
  useEffect(() => {
    const cleanup = initSecurityProfiler();
    return cleanup;
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white relative">
        <AttackSimulator />

        <Routes>
          <Route path="/" element={<Login onSuccess={() => window.location.href = "/bank"} />} />
          
          <Route path="/bank" element={<BankDashboard onLogout={() => window.location.href = "/"} />} />
          
          <Route path="/dev" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
