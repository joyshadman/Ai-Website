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
  ShieldCheck
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
    current_code: `
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-black text-white flex items-center justify-center h-screen font-sans">
          <div class="text-center space-y-4">
            <h1 class="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Neural Interface v1</h1>
            <p class="text-gray-400 text-lg">AI-Generated architecture optimized for edge deployment.</p>
            <div class="flex gap-4 justify-center">
              <div class="px-6 py-2 bg-white/10 border border-white/10 rounded-full">Explorer</div>
              <div class="px-6 py-2 bg-purple-600 rounded-full">Deploy Now</div>
            </div>
          </div>
        </body>
      </html>
    `
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
  const fetchproject = async () => {
  
  
  }

  useEffect(() => {
    if (!user) return;
    if (progress < 100) {
      const timer = setTimeout(() => {
        const nextStep = steps.find((s) => s.p > progress) || steps[steps.length - 1];
        setProgress((prev) => prev + 1);
        setStatus(nextStep.s);
        if (progress % 15 === 0) {
          setLogs((prev) => [...prev.slice(-5), nextStep.l]);
        }
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
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: `Refining UI components based on "${newMsg.text}"...` }]);
      setIsTyping(false);
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
              <button onClick={() => setDevice("desktop")} className={`p-2 rounded-lg ${device === "desktop" ? "bg-purple-500 shadow-lg shadow-purple-500/20" : "text-gray-500"}`}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setDevice("tablet")} className={`p-2 rounded-lg ${device === "tablet" ? "bg-purple-500 shadow-lg shadow-purple-500/20" : "text-gray-500"}`}><Tablet className="w-4 h-4" /></button>
              <button onClick={() => setDevice("phone")} className={`p-2 rounded-lg ${device === "phone" ? "bg-purple-500 shadow-lg shadow-purple-500/20" : "text-gray-500"}`}><Smartphone className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Encrypted</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"><Save className="w-4 h-4" /> Save Draft</button>
            <button disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-30">Publish</button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">          
          <div className="lg:col-span-4 space-y-6">
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center"><UserCircle className="w-5 h-5" /></div>
                <span className="text-sm font-bold">{user.name}</span>
              </div>
              <button onClick={() => setUser(null)} className="text-gray-500 hover:text-white"><LogOut className="w-4 h-4" /></button>
            </div>

            <motion.div className="bg-black border border-white/10 rounded-[2.5rem] flex flex-col h-[380px] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/[0.01]">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Neural Chat v4</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] ${msg.role === "user" ? "bg-purple-600 shadow-lg shadow-purple-500/10" : "bg-white/5 border border-white/10 text-gray-300"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.01] border-t border-white/5">
                <div className="relative">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} type="text" placeholder="Refine design..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-[11px] focus:border-purple-500 transition-all" />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-500"><Send className="w-3 h-3" /></button>
                </div>
              </form>
            </motion.div>

            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6">
              <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-3 uppercase"><span>Generating Architecture</span> <span>{progress}%</span></div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-blue-500" />
              </div>
              <p className="mt-4 text-[11px] text-gray-500 font-mono italic">{status}</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <motion.div 
              animate={{ width: getDeviceWidth(), margin: device === "desktop" ? "0" : "0 auto" }}
              className="relative group w-full aspect-video bg-gray-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500"
            >
              <div className="relative w-full h-full bg-gray-950 overflow-hidden">
                {project.current_code ? (
                  <iframe 
                    srcDoc={project.current_code}
                    className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                    sandbox="allow-scripts allow-same-origin"
                    style={{ transform: device === 'phone' ? 'scale(0.31)' : device === 'tablet' ? 'scale(0.64)' : 'scale(1)' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 font-mono text-xs">
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Awaiting Generation...
                  </div>
                )}
                
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="relative w-20 h-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-2 border-purple-500/20 border-t-purple-500 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center text-purple-400 font-bold text-xs">{progress}%</div>
                      </div>
                      <span className="mt-4 text-xs font-bold tracking-widest text-white/40 uppercase">Neural Synthesis</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {isComplete && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-6 right-6 px-4 py-2 bg-green-500 text-black text-[10px] font-black uppercase rounded-full shadow-lg">
                  Build Verified
                </motion.div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Builder;