import { useParams } from "react-router-dom"
import { AuthView } from "@daveyplate/better-auth-ui"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Sparkles, Zap, Shield } from "lucide-react"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="flex min-h-screen w-full overflow-x-hidden" style={{ background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        .auth-glow {
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.25), transparent);
        }
        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
        }
        .orb {
          filter: blur(80px);
          border-radius: 50%;
          position: absolute;
          pointer-events: none;
        }
        .feature-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 999px;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.01em;
          transition: all 0.2s;
        }
        .feature-pill:hover {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.3);
          color: rgba(255,255,255,0.9);
        }
        .feature-pill svg {
          color: #8b5cf6;
          flex-shrink: 0;
        }
        .brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 32px;
        }

        /* AuthView overrides */
        .auth-shell .dark {
          --background: transparent;
          --card: transparent;
          --card-foreground: #fafafa;
          --foreground: #fafafa;
          --muted: rgba(255,255,255,0.06);
          --muted-foreground: rgba(255,255,255,0.45);
          --border: rgba(255,255,255,0.1);
          --input: rgba(255,255,255,0.06);
          --ring: #8b5cf6;
          --primary: #8b5cf6;
          --primary-foreground: #fff;
          --radius: 0.75rem;
        }
        .auth-shell input {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: #fff !important;
          border-radius: 10px !important;
          height: 44px !important;
          font-size: 14px !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .auth-shell input:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15) !important;
          outline: none !important;
        }
        .auth-shell input::placeholder { color: rgba(255,255,255,0.3) !important; }
        .auth-shell label {
          color: rgba(255,255,255,0.55) !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          letter-spacing: 0.04em !important;
          text-transform: uppercase !important;
        }
        .auth-shell button[type="submit"] {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6) !important;
          border: none !important;
          border-radius: 10px !important;
          height: 44px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          letter-spacing: 0.02em !important;
          box-shadow: 0 4px 24px rgba(139,92,246,0.35) !important;
          transition: all 0.2s !important;
        }
        .auth-shell button[type="submit"]:hover {
          box-shadow: 0 6px 32px rgba(139,92,246,0.5) !important;
          transform: translateY(-1px) !important;
        }
        .auth-shell button[type="submit"]:active { transform: scale(0.98) !important; }
        .auth-shell a { color: #a78bfa !important; font-size: 13px !important; }
        .auth-shell a:hover { color: #c4b5fd !important; }
        .auth-shell h1, .auth-shell h2, .auth-shell h3 {
          font-family: 'Syne', sans-serif !important;
          color: #fff !important;
          font-size: 22px !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
          margin-bottom: 6px !important;
        }
        .auth-shell p {
          color: rgba(255,255,255,0.4) !important;
          font-size: 13px !important;
          margin-bottom: 24px !important;
        }
        /* Google / social button */
        .auth-shell [class*="social"] button,
        .auth-shell button:not([type="submit"]):not([aria-label]) {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          color: #fff !important;
          height: 44px !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          transition: all 0.2s !important;
        }
        .auth-shell [class*="social"] button:hover,
        .auth-shell button:not([type="submit"]):not([aria-label]):hover {
          background: rgba(255,255,255,0.09) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        /* Divider */
        .auth-shell [class*="separator"], .auth-shell hr {
          border-color: rgba(255,255,255,0.08) !important;
        }
        .auth-shell [class*="separator"] span {
          color: rgba(255,255,255,0.3) !important;
          font-size: 11px !important;
          background: transparent !important;
        }
      `}</style>

      {/* ── Left Panel ───────────────────────────────────────────────────── */}
      <section className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#050505] p-16 grid-bg">

        {/* Orbs */}
        <div className="orb w-[500px] h-[500px] bg-violet-600/20 -top-32 -left-32" />
        <div className="orb w-[300px] h-[300px] bg-indigo-600/15 bottom-20 right-10" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top brand */}
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>
              Apexium
            </span>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <div className="brand-tag">
              <Sparkles size={10} />
              AI-Powered Platform
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px,4vw,52px)", lineHeight: 1.1, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20 }}>
              The future of<br />
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                the web
              </span>
              {" "}is here.
            </h1>

            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}>
              Transform complex ideas into high-performance digital experiences. Built by intelligence, deployed in seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: Zap, text: "Instant Enterprise-Grade Deployment" },
                { icon: Shield, text: "Autonomous SEO & Performance Scaling" },
                { icon: CheckCircle2, text: "Neural Interface Design Engine" },
              ].map((item, i) => (
                <div key={i} className="feature-pill">
                  <item.icon size={14} />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div style={{ borderLeft: "2px solid rgba(139,92,246,0.4)", paddingLeft: 16 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              "The most advanced AI website engine<br />we've ever integrated into our stack."
            </p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 6, margin: "6px 0 0" }}>
              — Early Access Partner
            </p>
          </div>
        </div>
      </section>

      {/* ── Right Panel ──────────────────────────────────────────────────── */}
      <section className="relative flex flex-1 flex-col items-center justify-center p-6 auth-glow">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>
            Apexium
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="w-full auth-shell"
            style={{ maxWidth: 380 }}
          >
            <div className="card-glass rounded-2xl p-8">
              <div className="dark">
                <AuthView pathname={pathname} />
              </div>
            </div>

            <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
              By continuing, you agree to our{" "}
              <a href="#" style={{ color: "rgba(139,92,246,0.7)", textDecoration: "none" }}>Terms</a>
              {" "}and{" "}
              <a href="#" style={{ color: "rgba(139,92,246,0.7)", textDecoration: "none" }}>Privacy Policy</a>
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  )
}