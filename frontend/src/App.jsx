import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import BankDashboard from "./components/BankDashboard";
import AttackSimulator from "./components/AttackSimulator";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white relative">
        {/* Persistent Attack Simulator overlay */}
        <AttackSimulator />

        <Routes>
          {/* Main Login Entry */}
          <Route path="/" element={<Login onSuccess={() => window.location.href = "/bank"} />} />
          
          {/* Legitimate Bank View */}
          <Route path="/bank" element={<BankDashboard onLogout={() => window.location.href = "/"} />} />
          
          {/* Admin/Dev Dashboard */}
          <Route path="/dev" element={<Dashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
