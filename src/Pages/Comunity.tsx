import React, { useState, useEffect, useRef } from "react";
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
  Tablet,
  Trash2,
  Save,
  Users,
  Lock,
  UserCircle,
  LogOut,
  Send,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import Btn from "../components/Btn.tsx";

const Builder = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: "Alex Designer",
    email: "alex@neural.ai"
  });

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing Neural Weights...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>("desktop");
  const [project, setProject] = useState({
    id: "apex_8821",
    current_code: "" // Initialized as empty for fetching
  });

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "System online. How can I refine the architecture?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { p: 10, s: "Analyzing prompt intent...", l: "> GET /neural-engine/intent" },
    { p: 30, s: "Generating Component Tree...", l: "> COMPILING: Navbar, Hero, Features" },
    { p: 50, s: "Applying Glassmorphic Styling...", l: "> TAILWIND: backdrop-blur-xl border-white/10" },
    { p: 70, s: "Injecting Framer Motion...", l: "> ANIMATION: spring(stiffness: 100)" },
    { p: 90, s: "Optimizing for Edge Deployment...", l: "> PUSHING: Vercel Edge Network" },
    { p: 100, s: "Construction Complete.", l: "> READY: neural-site-v1.deploy" },
  ];

  // Placeholder for Backend Fetching
  const fetchProject = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      // REPLACE THIS WITH YOUR BACKEND URL
      // const response = await fetch(`your-backend-api.com/projects/${project.id}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockCode = `
        <html>
          <head><script src="https://cdn.tailwindcss.com"></script></head>
          <body class="bg-black text-white flex items-center justify-center h-screen font-sans">
            <div class="text-center space-y-6 p-8 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[3rem]">
              <h1 class="text-6xl font-black bg-gradient-to-br from-purple-400 via-fuchsia-500 to-blue-500 bg-clip-text text-transparent italic">
                A P E X
              </h1>
              <p class="text-gray-400 font-mono text-sm tracking-[0.3em]">RE-FETCHED FROM BACKEND</p>
              <div class="flex gap-4 justify-center">
                <div class="w-12 h-1 bg-purple-500 rounded-full"></div>
                <div class="w-12 h-1 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Simulating synthesis progress while fetching
      setProject(prev => ({ ...prev, current_code: mockCode }));
    } catch (error) {
      console.error("Failed to fetch project:", error);
      setStatus("Error connecting to neural node...");
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch on load
    if (!project.current_code) {
        fetchProject();
    }

    if (progress < 100) {
      const timer = setTimeout(() => {
        const nextStep = steps.find((s) => s.p > progress) || steps[steps.length - 1];
        setProgress((prev) => prev + 1);
        setStatus(nextStep.s);
      }, 40); 
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      setIsGenerating(false);
    }
  }, [progress, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { role: "user" as const, text: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");
    setIsTyping(true);
    
    // Logic to send chat to backend and update current_code
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: `Re-synthesizing interface based on "${newMsg.text}"...` }]);
      setIsTyping(false);
      fetchProject(); // Re-fetch/Re-generate on chat
    }, 1500);
  };

  const getDeviceWidth = () => {
    switch(device) {
      case 'phone': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center"><Btn variant="primary" onClick={() => setUser({name: "Demo", email: "a@b.com"})}>Login</Btn></div>;

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-20 px-6 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Workspace Toolbar */}
        <motion.div className="mb-8 flex items-center justify-between p-4 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2rem]">
          <div className="flex items-center gap-4">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button onClick={() => setDevice("desktop")} className={`p-2 rounded-lg ${device === "desktop" ? "bg-purple-500 shadow-lg shadow-purple-500/20 text-white" : "text-gray-500"}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setDevice("tablet")} className={`p-2 rounded-lg ${device === "tablet" ? "bg-purple-500 shadow-lg shadow-purple-500/20 text-white" : "text-gray-500"}`}><Tablet className="w-4 h-4" /></button>
              <button onClick={() => setDevice("phone")} className={`p-2 rounded-lg ${device === "phone" ? "bg-purple-500 shadow-lg shadow-purple-500/20 text-white" : "text-gray-500"}`}><Smartphone className="w-4 h-4" /></button>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <button onClick={fetchProject} className="p-2 text-gray-500 hover:text-purple-400 transition-colors">
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><Save className="w-4 h-4" /> Save</button>
            <button disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-30">Publish</button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">          
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xs">A</div>
                <span className="text-sm font-bold">{user.name}</span>
              </div>
              <button onClick={() => setUser(null)} className="text-gray-500 hover:text-white"><LogOut className="w-4 h-4" /></button>
            </div>

            {/* Chat Module */}
            <motion.div className="bg-black border border-white/10 rounded-[2.5rem] flex flex-col h-[400px] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Neural Engine</span>
                </div>
                {isTyping && <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${msg.role === "user" ? "bg-purple-600 shadow-lg shadow-purple-500/10" : "bg-white/5 border border-white/10 text-gray-300"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.01] border-t border-white/5">
                <div className="relative">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} type="text" placeholder="Tell AI what to change..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-[11px] focus:border-purple-500 transition-all outline-none" />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-400 transition-colors"><Send className="w-4 h-4" /></button>
                </div>
              </form>
            </motion.div>

            {/* Progress Bar */}
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest"><span>System Status</span> <span>{progress}%</span></div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-blue-500" />
              </div>
              <p className="mt-4 text-[11px] text-gray-500 font-mono italic truncate">{status}</p>
            </div>
          </div>

          {/* RIGHT SIDE: PREVIEW WORKSPACE */}
          <div className="lg:col-span-8">
            <motion.div 
              animate={{ 
                width: getDeviceWidth(), 
                margin: device === "desktop" ? "0" : "0 auto" 
              }}
              className="relative group w-full h-[650px] bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)] transition-all duration-700 ease-in-out"
            >
              {/* Browser Header Decorator */}
              <div className="absolute top-0 inset-x-0 h-10 bg-white/5 border-b border-white/5 z-30 flex items-center px-6 justify-between">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <div className="bg-black/40 px-4 py-1 rounded-md text-[9px] text-gray-500 font-mono border border-white/5">
                    {project.id}.neural-site.ai
                </div>
                <ExternalLink className="w-3 h-3 text-gray-600" />
              </div>

              <div className="pt-10 w-full h-full relative overflow-hidden">
                {project.current_code ? (
                  <iframe 
                    srcDoc={project.current_code}
                    className="w-full h-full border-none"
                    title="Neural Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-600 font-mono text-xs">
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" /> Connecting to Neural Backend...
                  </div>
                )}
                
                {/* Generation Overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex flex-col items-center justify-center"
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <motion.div 
                            animate={{ rotate: 360 }} 
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
                            className="absolute inset-0 border-t-2 border-r-2 border-purple-500 rounded-full" 
                        />
                        <motion.div 
                            animate={{ rotate: -360 }} 
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }} 
                            className="absolute inset-2 border-b-2 border-l-2 border-blue-500/30 rounded-full" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">{progress}%</div>
                      </div>
                      <span className="text-[10px] font-black tracking-[0.5em] text-purple-500 uppercase">Synchronizing Build</span>
                      <div className="mt-8 flex gap-1">
                         {[...Array(3)].map((_, i) => (
                             <motion.div 
                                key={i}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                className="w-1 h-1 bg-white/20 rounded-full"
                             />
                         ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {isComplete && (
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }} 
                        animate={{ x: 0, opacity: 1 }} 
                        className="absolute bottom-8 right-8 flex items-center gap-3 px-5 py-2.5 bg-white text-black rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.2)] z-50"
                    >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Neural Build Ready</span>
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