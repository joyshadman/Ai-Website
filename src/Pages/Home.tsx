import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Wand2, 
  Globe, 
  Cpu, 
  BotMessageSquare, 
  Loader2,
  MousePointer2
} from "lucide-react";
import Navbar from "../components/Navbar.tsx";

// Interface for the GlassCard props
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

// Interface for Feature items
interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => (
  <div className={`backdrop-blur-2xl bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  const features: FeatureItem[] = [
    { icon: <Cpu />, title: "Neural Layouts", desc: "Our engine analyzes your prompt to generate unique visual structures." },
    { icon: <Globe />, title: "Global CDN", desc: "Instant deployment across 100+ edge locations for blazing speed." },
    { icon: <Zap />, title: "Perfect Performance", desc: "Every single build achieves a perfect 100 Lighthouse score." }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-purple-500/30 font-sans">
      
      {/* --- BACKGROUND DECOR --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" 
        />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.05]">
              Generate <br /> your future.
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-20 leading-relaxed font-light">
              Apexium is the neural architect that instantly transforms your description into fully animated, high-performance digital experiences.
            </p>
          </motion.div>

          {/* --- AI CHAT COMMAND CENTER --- */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="max-w-5xl mx-auto mb-40 relative group"
          >
            <motion.div 
              animate={{ opacity: loading ? 0.8 : [0.2, 0.5, 0.2], scale: loading ? 1.05 : [1, 1.02, 1] }}
              transition={{ duration: loading ? 0.5 : 4, repeat: loading ? Infinity : 0, ease: "easeInOut" }}
              className={`absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-[2.5rem] blur transition duration-1000 ${loading ? 'opacity-80' : 'opacity-20 group-hover:opacity-60'}`}
            />
            
            <form onSubmit={onSubmitHandler}>
              <GlassCard className={`relative p-3 flex flex-col md:flex-row items-center gap-3 border-white/20 shadow-[0_0_60px_-10px_rgba(168,85,247,0.15)] overflow-hidden transition-all duration-500 ${loading ? 'scale-[0.98] border-purple-500/50' : ''}`}>
                
                <motion.div
                  animate={{
                    background: loading 
                      ? "radial-gradient(40% 40% at 50% 50%, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0) 100%)"
                      : [
                        "radial-gradient(40% 40% at 30% 50%, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 100%)",
                        "radial-gradient(40% 40% at 70% 50%, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 100%)",
                        "radial-gradient(40% 40% at 30% 50%, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0) 100%)",
                      ]
                  }}
                  transition={{ duration: loading ? 1 : 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 pointer-events-none"
                />

                <div className="flex-1 flex items-center px-6 w-full relative z-10">
                  <BotMessageSquare className={`w-5 h-5 mr-5 shrink-0 transition-colors ${loading ? 'text-purple-400 animate-pulse' : 'text-purple-400'}`} />
                  <input 
                    type="text"
                    disabled={loading}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={loading ? "Analyzing architectural patterns..." : "Describe your site..."}
                    className="w-full bg-transparent py-7 text-2xl outline-none placeholder:text-gray-600 text-white font-medium disabled:opacity-50"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="w-full md:w-auto bg-white text-black p-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95 group relative z-10 shrink-0 disabled:bg-gray-800 disabled:text-gray-500"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        className="flex items-center gap-3"
                      >
                        <span>Materializing</span>
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <span>Materialize</span>
                        <Wand2 className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </GlassCard>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-3 relative z-10">
              {['Dark Portfolio', 'Web3 Platform', 'E-commerce UI', 'Design Studio'].map((tag) => (
                <button 
                  key={tag}
                  disabled={loading}
                  onClick={() => setInputValue(tag)}
                  className="px-5 py-2.5 rounded-full border border-white/5 bg-white/5 text-sm font-medium text-gray-400 hover:border-purple-500/50 hover:text-purple-400 transition-all hover:bg-white/[0.08] disabled:opacity-30"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Dynamic Preview Section */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-4 space-y-6">
              {features.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  key={i} 
                  className="flex gap-5 p-7 rounded-3xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1.5">{item.title}</h4>
                    <p className="text-gray-500 text-base leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-8">
              <GlassCard className="p-4 border-white/5 overflow-hidden group shadow-xl">
                <div className="relative aspect-[16/10] bg-[#080808] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="absolute top-0 w-full h-11 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="mx-auto w-1/3 h-5 bg-white/5 rounded-md" />
                  </div>
                  
                  <div className="pt-24 px-12">
                    <motion.div 
                      animate={{ 
                        opacity: loading ? [0.2, 0.8, 0.2] : [0.5, 1, 0.5],
                        width: loading ? ["20%", "80%", "40%"] : "66.6%"
                      }}
                      transition={{ duration: loading ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
                      className="h-10 bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-transparent rounded-lg mb-6" 
                    />
                    <div className="grid grid-cols-3 gap-5">
                      {[1, 2, 3].map((idx) => (
                        <motion.div 
                          key={idx}
                          animate={loading ? { scale: [1, 0.95, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                          transition={{ duration: 1, repeat: Infinity, delay: idx * 0.2 }}
                          className="h-40 bg-white/5 rounded-2xl border border-white/5" 
                        />
                      ))}
                    </div>
                  </div>

                  <motion.div 
                    animate={loading ? {
                      x: [0, 100, -100, 0],
                      y: [0, -50, 50, 0],
                      scale: [1, 1.2, 1]
                    } : { y: [0, -20, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: loading ? 2 : 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-12 right-12 p-4 bg-purple-600 rounded-2xl shadow-3xl shadow-purple-600/50"
                  >
                    <MousePointer2 className="w-7 h-7" />
                  </motion.div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}