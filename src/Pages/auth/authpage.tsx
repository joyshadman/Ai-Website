import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Sparkles, Zap, Shield } from "lucide-react"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="flex min-h-screen w-full bg-black overflow-x-hidden">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-zinc-800 bg-[#050505] p-16 lg:flex">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white">
          </div>

          <div className="mt-20 max-w-lg">
            <h1 className="text-5xl font-medium leading-tight text-white mt-40">
              The future of the web, <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                built by intelligence.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Experience the world's most advanced AI website engine. Transform complex ideas into 
              high-performance digital experiences in seconds.
            </p>

            <ul className="mt-10 space-y-5">
              {[
                { icon: Zap, text: "Instant Enterprise-Grade Deployment" },
                { icon: Shield, text: "Autonomous SEO & Scaling" },
                { icon: CheckCircle2, text: "Neural Interface Design" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <item.icon className="h-5 w-5 text-purple-500" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.08),transparent_70%)] lg:hidden" />

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{
              ["--primary" as string]: "240 5.9% 90%",
              ["--primary-foreground" as string]: "240 5.9% 10%",
              ["--ring" as string]: "263.4 70% 50.4%",
              ["--radius" as string]: "0.75rem",
            }}
            // Adjusted max-width and background for mobile clarity
            className="relative z-10 w-full max-w-[400px] rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-md lg:bg-transparent lg:border-none lg:shadow-none"
          >
            {/* Top Accent Line (Visible on Mobile to define the card) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent lg:hidden" />

            {/* Added a mobile-only logo to ensure users know where they are */}
            <div className="flex flex-col items-center mb-8 lg:hidden">
                <Sparkles className="h-8 w-8 text-purple-500 mb-2" />
                <h2 className="text-xl font-bold text-white">Apexium AI</h2>
            </div>

            <div className="px-2 py-4 sm:px-6 lg:p-0">
              <div className="dark">
                <AuthView pathname={pathname} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <style>{`
        .dark input {
          background-color: #0c0c0e !important;
          border-color: #27272a !important;
          color: #fafafa !important;
        }
        .dark input:focus {
          border-color: #7c3aed !important;
        }
        .dark label { color: #a1a1aa !important; }
        .dark button[type="submit"] {
          font-weight: 600;
          height: 2.75rem;
          transition: transform 0.1s;
        }
        .dark button[type="submit"]:active { transform: scale(0.98); }
        .dark a { color: #a78bfa !important; }
      `}</style>
    </main>
  )
}