import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { typingTracker, mouseTracker } from "../utils/behavior";
import { getFingerprint } from "../utils/fingerprint";
import OTPModal from "./OTPModal";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showOTP, setShowOTP] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
        {
          username,
          password,
          behavior: {
            typing: typingTracker.getData(),
            mouse: mouseTracker.getData(),
          },
          device: getFingerprint(), // <--- Added device fingerprinting
        },
      );

      if (response.data.status === "mfa_required") {
        setShowOTP(true);
        setStatus({ type: "warning", message: response.data.message });
      } else {
        setStatus({
          type: "success",
          message: `Success! Token: ${response.data.token}`,
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.detail || "Authentication failed",
      });
    }
  };

  const handleOTPVerify = (otp) => {
    if (otp === "123456") {
      setShowOTP(false);
      setStatus({
        type: "success",
        message: "MFA Verified! Session authenticated securely.",
      });
    } else {
      setShowOTP(false);
      setStatus({ type: "error", message: "Invalid OTP. Access Denied." });
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-950"
      onMouseMove={(e) => mouseTracker.onMouseMove(e)}
      onClick={(e) => mouseTracker.onClick(e)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center tracking-wide">
          Sentinel<span className="text-blue-500">AI</span>
        </h2>

        {status.message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${status.type === "error" ? "bg-red-900/50 text-red-200" : status.type === "warning" ? "bg-yellow-900/50 text-yellow-200" : "bg-green-900/50 text-green-200"}`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              required
              onKeyDown={(e) => typingTracker.onKeyDown(e)}
              onKeyUp={(e) => typingTracker.onKeyUp(e)}
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              onKeyDown={(e) => typingTracker.onKeyDown(e)}
              onKeyUp={(e) => typingTracker.onKeyUp(e)}
              className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg mt-2"
            onClick={(e) => mouseTracker.onClick(e)}
          >
            Authenticate Session
          </button>
        </form>
      </motion.div>
      {showOTP && <OTPModal onVerify={handleOTPVerify} />}
    </div>
  );
}
