import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldAlert,
  Activity,
  Users,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

const mockData = [
  { time: "10:00", risk: 20 },
  { time: "10:05", risk: 25 },
  { time: "10:10", risk: 15 },
  { time: "10:15", risk: 85 },
  { time: "10:20", risk: 35 },
  { time: "10:25", risk: 10 },
];

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/alerts");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newAlert = {
        id: Date.now(),
        ...data,
        time: new Date().toLocaleTimeString(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts
    };
    return () => ws.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              SentinelAI
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full text-sm font-bold border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <Activity className="w-4 h-4 animate-pulse" /> Live Monitoring
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Active Sessions",
              val: "1,204",
              icon: Users,
              color: "text-blue-400",
            },
            {
              label: "Avg Risk Score",
              val: "18.5",
              icon: Activity,
              color: "text-green-400",
            },
            {
              label: "Critical Alerts",
              val: alerts.length,
              icon: AlertTriangle,
              color: "text-red-500",
              alert: alerts.length > 0,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm ${stat.alert ? "bg-red-950/20 border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.1)]" : "bg-gray-900/50 border-gray-800 shadow-lg"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">
                    {stat.label}
                  </h3>
                  <p className={`text-4xl font-black ${stat.color}`}>
                    {stat.val}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 opacity-50 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-xl h-[450px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Risk Analysis Trend
            </h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={mockData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    borderColor: "#374151",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-xl overflow-y-auto h-[450px] relative">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 sticky top-0 bg-gray-900/90 py-2 z-10">
              <ShieldAlert className="w-5 h-5 text-red-500" /> Live Threat
              Stream
            </h3>
            {alerts.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 text-sm italic">
                  Listening for anomalies...
                </p>
              </div>
            ) : null}
            <div className="space-y-3 mt-2">
              {alerts.map((alert) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={alert.id}
                  className="p-4 bg-gray-950/80 border border-red-900/30 rounded-xl relative overflow-hidden group hover:border-red-500/50 transition-colors"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600"></div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-gray-300">
                      {alert.user}
                    </span>
                    <span className="text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-red-400 text-sm font-semibold mb-3">
                    {alert.type}
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${alert.risk}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-red-600 to-red-400 h-1.5 rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
