import { useState } from "react";
import { motion } from "framer-motion";

export default function OTPModal({
  onVerify,
  title = "Adaptive MFA",
  description = "Security anomaly detected. Enter the 6-digit OTP sent to your registered phone number.",
}) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 p-8 rounded-xl border border-gray-700 max-w-sm w-full text-center shadow-2xl"
      >
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{description}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            maxLength="6"
            placeholder="123456"
            className="w-full bg-gray-950 text-white border border-gray-700 text-center text-2xl tracking-[0.5em] rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 mb-4"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            Verify Identity
          </button>
        </form>
      </motion.div>
    </div>
  );
}
