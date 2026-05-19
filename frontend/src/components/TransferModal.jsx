import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { typingTracker, mouseTracker } from "../utils/behavior";
import { getFingerprint } from "../utils/fingerprint";
import { X, Send } from "lucide-react";

export default function TransferModal({ isOpen, onClose, onTransferSuccess, onMfaRequired, onBlock }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/auth/transfer", {
        username: "admin",
        recipient,
        amount: parseFloat(amount),
        behavior: {
          typing: typingTracker.getData(),
          mouse: mouseTracker.getData(),
        },
        device: getFingerprint(),
      });

      if (response.data.status === "mfa_required") {
        onMfaRequired(response.data.message);
      } else {
        onTransferSuccess(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        onBlock(error.response.data.detail);
      } else {
        alert(error.response?.data?.detail || "Transfer failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1001] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Send size={20} className="text-blue-500" /> New Transfer
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Recipient Name</label>
            <input
              type="text"
              required
              className="w-full bg-gray-950 text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
              placeholder="e.g. John Doe"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              onKeyDown={(e) => typingTracker.onKeyDown(e)}
              onKeyUp={(e) => typingTracker.onKeyUp(e)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                className="w-full bg-gray-950 text-white border border-gray-800 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => typingTracker.onKeyDown(e)}
                onKeyUp={(e) => typingTracker.onKeyUp(e)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? "Analyzing Behavior..." : "Secure Transfer"}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">
              Protected by SentinelAI Biometric Shield
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
