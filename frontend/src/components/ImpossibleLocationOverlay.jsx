import { motion } from "framer-motion";
import { ShieldAlert, Lock } from "lucide-react";

export default function ImpossibleLocationOverlay() {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"
            />
            <div className="relative bg-red-500/10 border border-red-500/20 p-6 rounded-3xl">
              <ShieldAlert size={80} className="text-red-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white tracking-tight">
            Impossible location detected. <br />
            <span className="text-red-500 underline decoration-red-500/30 underline-offset-8">
              Access blocked.
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            A security anomaly was detected in your network environment. 
            To protect your account from unauthorized access via VPNs or 
            Proxies, this session has been terminated.
          </p>
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 text-left">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Lock className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Security Action</p>
              <p className="text-sm text-white">Session invalidated & Token destroyed</p>
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            Acknowledge & Refresh
          </button>
        </div>
      </motion.div>
    </div>
  );
}
