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
import Builder from "./Builder.tsx"; 

// --- INTERFACES ---
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

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
  const [showBuilder, setShowBuilder] = useState<boolean>(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:3000";

  const onSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    setLoading(true);
    setErrorMessage("");
    setShowBuilder(true); 

    try {
      const response = await fetch(`${apiBaseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputValue.trim() }),
      });

      const data = (await response.json()) as { html?: string; error?: string };
      if (!response.ok || !data.html) {
        throw new Error(data.error || "Could not generate website.");
      }

      setGeneratedHtml(data.html);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error occurred.");
      setShowBuilder(false); 
      setLoading(false);
    }
  };

  const features: FeatureItem[] = [
    { icon: <Cpu />, title: "Neural Layouts", desc: "Our engine analyzes your prompt to generate unique visual structures." },
    { icon: <Globe />, title: "Global CDN", desc: "Instant deployment across 100+ edge locations for blazing speed." },
    { icon: <Zap />, title: "Perfect Performance", desc: "Every single build achieves a perfect 100 Lighthouse score." }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" 
        />
      </div>

      <AnimatePresence mode="wait">
        {!showBuilder ? (
          <motion.section 
            key="home-hero"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative pt-44 pb-20 px-6"
          >
            <div className="max-w-7xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
              >
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent leading-[1.05]">
                  Generate <br /> your future.
                </h1>
                <p className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto mb-20 leading-relaxed font-light">
                  Apexium is the neural architect that transforms descriptions into fully animated, high-performance digital experiences.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto mb-40 relative group"
              >
                <form onSubmit={onSubmitHandler}>
                  <GlassCard className={`relative p-3 flex flex-col md:flex-row items-center gap-3 border-white/20 shadow-[0_0_60px_-10px_rgba(168,85,247,0.15)] overflow-hidden`}>
                    <div className="flex-1 flex items-center px-6 w-full relative z-10">
                      <BotMessageSquare className="w-5 h-5 mr-5 shrink-0 text-purple-400" />
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Describe your vision (e.g. A glassy SaaS landing page)..."
                        className="w-full bg-transparent py-7 text-2xl outline-none placeholder:text-gray-600 text-white font-medium"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-full md:w-auto bg-white text-black p-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95 group relative z-10 shrink-0 disabled:bg-gray-800 disabled:text-gray-500"
                    >
                      <span>Materialize</span>
                      <Wand2 className="w-5 h-5" />
                    </button>
                  </GlassCard>
                </form>
                {errorMessage && <p className="mt-4 text-sm text-red-400">{errorMessage}</p>}
              </motion.div>

              <div className="max-w-7xl mx-auto mt-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  {features.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                        {item.icon}
                      </div>
                      <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div 
            key="builder-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute top-10 left-10 z-50">
                <button 
                    onClick={() => setShowBuilder(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                >
                    ← Back to Prompt
                </button>
            </div>
            <Builder />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}