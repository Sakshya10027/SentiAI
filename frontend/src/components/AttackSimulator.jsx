import { useState } from "react";
import axios from "axios";
import { getFingerprint } from "../utils/fingerprint";

export default function AttackSimulator() {
  const [result, setResult] = useState(null);

  const triggerAttack = async (attackType) => {
    let payload = {
      username: "admin",
      password: "admin123",
      behavior: { typing: [], mouse: [] },
      device: getFingerprint(),
      ip_address: null,
    };

    if (attackType === "bot_script") {
      payload.behavior.typing = [
        { type: "keyup", dwellTime: 1 },
        { type: "keydown", flightTime: 1 },
      ];
      payload.behavior.mouse = [
        { type: "move", x: 1000, y: 1000, timeDiff: 1 },
      ];
    } else if (attackType === "stolen_session") {
      payload.behavior.mouse = [{ type: "move", x: 10, y: 10, timeDiff: 500 }];
    } else if (attackType === "impossible_travel") {
      payload.behavior.typing = [{ type: "keyup", dwellTime: 120 }];
      payload.behavior.mouse = [{ type: "move", x: 10, y: 10, timeDiff: 50 }];
      payload.ip_address = "220.181.38.148";
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        payload,
      );
      setResult({ type: "warning", text: response.data.message });
    } catch (error) {
      setResult({
        type: "error",
        text: error.response?.data?.detail || "Access Blocked",
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 w-72 bg-gray-900 border border-red-900/50 rounded-xl p-4 shadow-2xl z-50">
      {/* FIXED: Moved from top-right to bottom-left to prevent overlap */}
      <h3 className="text-red-500 font-bold mb-3 flex items-center gap-2">
        ⚠️ Attack Simulator
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => triggerAttack("bot_script")}
          className="w-full bg-gray-800 hover:bg-red-900/40 border border-gray-700 text-white text-sm py-2 rounded"
        >
          Inject Bot Script
        </button>
        <button
          onClick={() => triggerAttack("stolen_session")}
          className="w-full bg-gray-800 hover:bg-orange-900/40 border border-gray-700 text-white text-sm py-2 rounded"
        >
          Stolen Credentials
        </button>
        <button
          onClick={() => triggerAttack("impossible_travel")}
          className="w-full bg-gray-800 hover:bg-purple-900/40 border border-gray-700 text-white text-sm py-2 rounded"
        >
          Impossible Travel (Geo-Spoof)
        </button>
      </div>
      {result && (
        <div
          className={`mt-4 p-2 rounded text-xs ${result.type === "error" ? "bg-red-900/50 text-red-200" : "bg-yellow-900/50 text-yellow-200"}`}
        >
          <strong>AI Response:</strong>
          <br />
          {result.text}
        </div>
      )}
    </div>
  );
}
