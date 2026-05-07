"use client";
import { useParams } from "react-router-dom";
import { AuthView } from "@daveyplate/better-auth-ui";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { pathname } = useParams();
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-slate-950 overflow-hidden text-slate-200">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-lighten filter blur-[120px] opacity-20 animate-blob" />
      <div className="absolute -bottom-8 right-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-lighten filter blur-[120px] opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="mb-8 text-center ">
            <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 " >
              Welcome
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Please sign in to continue
            </p>
          </div>
          <div className="auth-ui-wrapper">
            <AuthView pathname={pathname} />
          </div>
        </div>
      </motion.div>
    </main>
  );
}