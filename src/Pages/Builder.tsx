import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Terminal,
  Globe,
  RotateCcw,
  Monitor,
  Smartphone,
  Trash2,
  Cloud, puck,
  Save,
  Users
} from "lucide-react";
import Btn from "../components/Btn.tsx";

const Builder = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Neural Weights...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const steps = [
    { p: 10, s: "Analyzing prompt intent...", l: "> GET /neural-engine/intent" },
    { p: 30, s: "Generating Component Tree...", l: "> COMPILING: Navbar, Hero, Features" },
    { p: 50, s: "Applying Glassmorphic Styling...", l: "> TAILWIND: backdrop-blur-xl border-white/10" },
    { p: 70, s: "Injecting Framer Motion...", l: "> ANIMATION: spring(stiffness: 100)" },
    { p: 90, s: "Optimizing for Edge Deployment...", l: "> PUSHING: Vercel Edge Network" },
    { p: 100, s: "Construction Complete.", l: "> READY: neural-site-v1.deploy" },
  ];

  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => {
        const nextStep = steps.find((s) => s.p > progress) || steps[steps.length - 1];
        setProgress((prev) => prev + 1);
        setStatus(nextStep.s);
        if (progress % 15 === 0) {
          setLogs((prev) => [...prev.slice(-5), nextStep.l]);
        }
      }, 40); // Slightly faster for better UX
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [progress]);

  const resetBuilder = () => {
    setProgress(0);
    setLogs([]);
    setIsComplete(false);
  };

  const handleDelete = () => {
    if(confirm("Are you sure you want to delete this build?")) {
      resetBuilder();
    }
  };

  const publishToCommunity = () => {
    alert("Project shared to the community gallery!");
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-20 px-6 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Workspace Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2rem]"
        >
          <div className="flex items-center gap-4">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setViewMode("desktop")}
                className={`p-2 rounded-lg transition-all ${viewMode === "desktop" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-gray-500 hover:text-white"}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("mobile")}
                className={`p-2 rounded-lg transition-all ${viewMode === "mobile" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" : "text-gray-500 hover:text-white"}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <span className="text-xs font-mono text-gray-500 truncate max-w-[150px]">project_id: apex_8821</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDelete}
              className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              title="Delete Build"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              title="Save Draft"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button 
              onClick={publishToCommunity}
              disabled={!isComplete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Users className="w-4 h-4" /> Publish
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: AI Terminal */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Neural Engine</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                  <span>Construction</span>
                  <span className="text-purple-400">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-400 h-10">{status}</p>
              </div>

              <div className="mt-8 bg-black/40 rounded-2xl p-4 font-mono text-[11px] text-purple-300/70 border border-white/5 space-y-2 h-40 overflow-hidden">
                <div className="flex items-center gap-2 text-gray-600 mb-2 border-b border-white/5 pb-2">
                  <Terminal className="w-3 h-3" /> Real-time Logs
                </div>
                {logs.map((log, i) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={i}>
                    {log}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {isComplete && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <Btn variant="primary" icon={Globe} fullWidth>Live Preview</Btn>
                  <Btn variant="glass" icon={RotateCcw} onClick={resetBuilder} fullWidth>Reset Weights</Btn>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Preview Canvas */}
          <div className="lg:col-span-8 relative">
            <motion.div 
              animate={{ 
                width: viewMode === "mobile" ? "375px" : "100%",
                margin: viewMode === "mobile" ? "0 auto" : "0"
              }}
              className="aspect-video bg-white/[0.01] border border-white/10 rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-all duration-500 ease-in-out"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
              
              <div className="p-8 space-y-8">
                {/* Simulated Content */}
                <motion.div animate={{ opacity: progress > 20 ? 1 : 0.2 }} className="h-10 w-full bg-white/5 rounded-xl border border-white/5" />
                
                <div className="space-y-4">
                  <motion.div animate={{ width: progress > 40 ? "70%" : "30%", opacity: progress > 30 ? 1 : 0.1 }} className="h-12 bg-gradient-to-r from-purple-500/20 to-transparent rounded-xl" />
                  <motion.div animate={{ width: "90%", opacity: progress > 50 ? 1 : 0.1 }} className="h-4 bg-white/5 rounded-full" />
                </div>

                <div className={`grid ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: progress > (70 + i*5) ? 1 : 0 }}
                      className="h-32 bg-white/5 border border-white/5 rounded-2xl" 
                    />
                  ))}
                </div>
              </div>

              {/* Completion Overlay */}
              <AnimatePresence>
                {isComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center flex-col"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-purple-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold">Build Verified</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;