import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { getFingerprint } from "../utils/fingerprint";
import OTPModal from "./OTPModal";

export default function AttackSimulator() {
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [currentAttack, setCurrentAttack] = useState("");

  const triggerAttack = async (attackType) => {
    const attackName = attackType.replace("_", " ").toUpperCase();
    setCurrentAttack(attackName);

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
      payload.ip_address = "220.181.38.148"; // Beijing IP
    } else if (attackType === "vpn_proxy") {
      payload.behavior.typing = [{ type: "keyup", dwellTime: 120 }];
      payload.ip_address = "185.242.226.21"; // Known M247 VPN Exit Node
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        payload,
      );

      // ALWAYS show OTP for simulator as requested by user
      setShowOTP(true);
      setResult({ type: "warning", text: response.data.message });
    } catch (error) {
      // Even if blocked (403), show the OTP challenge for the simulation flow
      setShowOTP(true);

      if (error.response?.status === 403) {
        setResult({ type: "error", text: error.response.data.detail });
      } else {
        setResult({
          type: "error",
          text: error.response?.data?.detail || "Access Blocked",
        });
      }
    }
  };

  const handleOTPVerify = (otp) => {
    if (otp === "123456") {
      setShowOTP(false);
      setResult({ type: "warning", text: "MFA Verified for " + currentAttack });
    } else {
      setShowOTP(false);
      setResult({ type: "error", text: "Invalid OTP. Attack Failed." });
    }
  };

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.02, cursor: "grabbing" }}
        className="fixed bottom-4 left-4 w-72 bg-gray-900 border border-red-900/50 rounded-xl p-4 shadow-2xl z-[1000] cursor-grab active:cursor-grabbing select-none"
      >
        <h3 className="text-red-500 font-bold mb-3 flex items-center gap-2 pointer-events-none">
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
          {location.pathname === "/" && (
            <button
              onClick={() => triggerAttack("impossible_travel")}
              className="w-full bg-gray-800 hover:bg-purple-900/40 border border-gray-700 text-white text-sm py-2 rounded"
            >
              Impossible Travel (Geo-Spoof)
            </button>
          )}
          <button
            onClick={() => triggerAttack("vpn_proxy")}
            className="w-full bg-gray-800 hover:bg-blue-900/40 border border-gray-700 text-white text-sm py-2 rounded"
          >
            Simulate VPN/Proxy Connection
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
      </motion.div>

      {showOTP && (
        <OTPModal
          onVerify={handleOTPVerify}
          title={`Shield Triggered: ${currentAttack}`}
          description="Security anomaly detected during simulation. Enter OTP to bypass."
        />
      )}
    </>
  );
}
