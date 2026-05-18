import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import TransferModal from "./TransferModal";
import OTPModal from "./OTPModal";
import ImpossibleLocationOverlay from "./ImpossibleLocationOverlay";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  ShieldCheck,
  LogOut,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function BankDashboard({ onLogout }) {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isBlocked, setIsBlocked] = useState(false);

  // --- Continuous Session Monitoring ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/verify-session",
        );
        if (response.data.status === "blocked") {
          setIsBlocked(true);
          // Destroy token (if stored in localStorage/cookies)
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Session verification failed", error);
        if (error.response?.status === 403) {
          setIsBlocked(true);
        }
      }
    };

    // Initial check
    checkSession();

    // Poll every 30 seconds
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);

  const transactions = [
    {
      id: 1,
      name: "Amazon.com",
      amount: -120.5,
      date: "Today",
      category: "Shopping",
    },
    {
      id: 2,
      name: "Salary Deposit",
      amount: 4500.0,
      date: "Yesterday",
      category: "Income",
    },
    {
      id: 3,
      name: "Starbucks Coffee",
      amount: -6.75,
      date: "2 days ago",
      category: "Food",
    },
    {
      id: 4,
      name: "Netflix Subscription",
      amount: -15.99,
      date: "3 days ago",
      category: "Entertainment",
    },
  ];

  const handleTransferSuccess = (msg) => {
    setIsTransferOpen(false);
    setMessage({ type: "success", text: msg });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleMfaRequired = (msg) => {
    setIsTransferOpen(false);
    setShowOTP(true);
  };

  const handleBlock = (reason) => {
    setIsTransferOpen(false);
    setMessage({ type: "error", text: reason });
  };

  const handleOTPVerify = (otp) => {
    if (otp === "123456") {
      setShowOTP(false);
      setMessage({
        type: "success",
        text: "MFA Verified! Payment sent successfully.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } else {
      setShowOTP(false);
      setMessage({ type: "error", text: "Invalid OTP. Transaction canceled." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 md:p-8">
      {isBlocked && <ImpossibleLocationOverlay />}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-blue-500" /> Sentinel
              <span className="text-blue-500">Bank</span>
            </h1>
            <p className="text-gray-400 text-sm">Welcome back, Administrator</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Total Balance
                </p>
                <h2 className="text-5xl font-bold mb-8">$12,450.80</h2>

                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-green-400/20 text-green-100 border border-green-400/30"
                        : "bg-red-400/20 text-red-100 border border-red-400/30"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all"
                  >
                    <ArrowUpRight size={20} /> Transfer
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all">
                    <ArrowDownLeft size={20} /> Request
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Wallet size={120} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <TrendingUp className="text-green-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Income
                </p>
                <p className="text-xl font-bold">+$5,200</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <ArrowDownLeft className="text-red-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Expenses
                </p>
                <p className="text-xl font-bold">-$1,120</p>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hidden md:block">
                <DollarSign className="text-blue-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Savings
                </p>
                <p className="text-xl font-bold">$2,300</p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  <History size={20} /> Recent Transactions
                </h3>
                <button className="text-blue-500 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-800">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-full ${tx.amount < 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}
                      >
                        {tx.amount < 0 ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <ArrowDownLeft size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{tx.name}</p>
                        <p className="text-gray-400 text-xs">
                          {tx.category} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold ${tx.amount < 0 ? "text-white" : "text-green-500"}`}
                    >
                      {tx.amount < 0
                        ? `-$${Math.abs(tx.amount).toFixed(2)}`
                        : `+$${tx.amount.toFixed(2)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Card Widget */}
            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} /> My Cards
              </h3>
              <div className="aspect-[1.58/1] bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 flex flex-col justify-between border border-white/10 shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-8 bg-yellow-500/80 rounded-md opacity-80" />
                  <p className="text-xs font-mono">SENTINEL PREMIUM</p>
                </div>
                <div>
                  <p className="text-lg font-mono tracking-widest mb-1">
                    **** **** **** 4590
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">
                        Card Holder
                      </p>
                      <p className="text-sm font-medium">ADMINISTRATOR</p>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500/80" />
                      <div className="w-6 h-6 rounded-full bg-orange-500/80" />
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-3 border border-gray-800 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                Manage Cards
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20">
              <ShieldCheck className="text-blue-500 mb-3" />
              <h4 className="font-bold mb-2">Security Active</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your session is protected by SentinelAI Behavioral Biometrics.
                We are monitoring your typing and mouse patterns to keep your
                account safe.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onTransferSuccess={handleTransferSuccess}
        onMfaRequired={handleMfaRequired}
        onBlock={handleBlock}
      />

      {showOTP && (
        <OTPModal
          onVerify={handleOTPVerify}
          title="Secure Transaction"
          description="High-value transfer detected. Enter 6-digit OTP to authorize."
        />
      )}
    </div>
  );
}
