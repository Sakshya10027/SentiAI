import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AttackSimulator from "./components/AttackSimulator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Persistent Attack Simulator overlay */}
      <AttackSimulator />

      <button
        onClick={() => setIsAuthenticated(!isAuthenticated)}
        className="fixed bottom-4 right-4 bg-gray-800 text-xs px-3 py-1 rounded border border-gray-700 z-50 hover:bg-gray-700"
      >
        DEV: Toggle UI ({isAuthenticated ? "Dashboard" : "Login"})
      </button>

      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
