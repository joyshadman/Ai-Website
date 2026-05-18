import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Monitor, Tablet, Smartphone, Code2, Eye,
  RotateCcw, Save, Globe, GlobeLock, Loader2,
  Sparkles, Check, Copy, Download, RefreshCw, ArrowLeft,
  Terminal, Clock
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import api from "@/configs/axios.ts";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Version {
  id: string;
  code: string;
  description: string;
  timestamp: string;
}

interface Project {
  id: string;
  name: string;
  initial_prompt: string;
  current_code: string | null;
  current_version_index: string | null;
  isPublished: boolean;
  conversation: Message[];
  versions: Version[];
  userId: string;
}

type Device = "desktop" | "tablet" | "phone";
type Tab = "chat" | "versions";

const deviceWidth: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  phone: "390px",
};

const POLL_INTERVAL = 3000;
const TIMEOUT_WARN = 60;   // warn at 60s
const TIMEOUT_HARD = 180;  // give up at 3min

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-purple-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
  >
    {msg.role === "assistant" && (
      <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-1 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
      </div>
    )}
    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
      msg.role === "user"
        ? "bg-purple-600/30 border border-purple-500/30 text-white rounded-tr-sm"
        : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm"
    }`}>
      {msg.content}
    </div>
  </motion.div>
);

const VersionItem: React.FC<{
  version: Version;
  isCurrent: boolean;
  onRollback: (id: string) => void;
  rolling: boolean;
}> = ({ version, isCurrent, onRollback, rolling }) => (
  <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
    isCurrent
      ? "border-purple-500/40 bg-purple-500/10"
      : "border-white/5 bg-white/[0.02] hover:border-white/10"
  }`}>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white font-medium truncate">{version.description}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">
        {new Date(version.timestamp).toLocaleString()}
      </p>
    </div>
    <div className="flex items-center gap-2 ml-2 shrink-0">
      {isCurrent ? (
        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">
          Current
        </span>
      ) : (
        <button
          onClick={() => onRollback(version.id)}
          disabled={rolling}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          {rolling
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RotateCcw className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  </div>
);

// ─── Generation Progress Panel ─────────────────────────────────────────────────

interface LogEntry {
  time: number;
  msg: string;
  type: "info" | "warn" | "success" | "error";
}

const GeneratingPanel: React.FC<{
  elapsed: number;
  logs: LogEntry[];
  logsRef: React.RefObject<HTMLDivElement>;
  onRetry: () => void;
  timedOut: boolean;
}> = ({ elapsed, logs, logsRef, onRetry, timedOut }) => {
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const isWarning = elapsed >= TIMEOUT_WARN;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 w-full max-w-lg mx-auto px-4">
      {/* Animated icon */}
      {!timedOut ? (
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-9 h-9 text-purple-400" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-3xl border border-purple-500/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Clock className="w-9 h-9 text-red-400" />
        </div>
      )}

      {/* Title + timer */}
      <div className="text-center">
        <p className="text-white font-semibold mb-1">
          {timedOut ? "Generation timed out" : "Building your website..."}
        </p>
        <div className={`flex items-center justify-center gap-2 text-sm font-mono ${
          timedOut ? "text-red-400" : isWarning ? "text-yellow-400" : "text-gray-400"
        }`}>
          <Clock className="w-3.5 h-3.5" />
          {fmt(elapsed)}
          {isWarning && !timedOut && (
            <span className="text-yellow-400 text-xs">(taking longer than usual)</span>
          )}
        </div>
        {timedOut && (
          <p className="text-gray-500 text-xs mt-2">
            The model may be overloaded. Try again or switch to a faster model.
          </p>
        )}
      </div>

      {/* Progress dots */}
      {!timedOut && (
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      {/* Live log terminal */}
      <div className="w-full bg-black/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
          <Terminal className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-500 font-mono">generation log</span>
          <span className="ml-auto text-[10px] font-mono text-gray-600">
            polling every {POLL_INTERVAL / 1000}s
          </span>
        </div>
        <div
          ref={logsRef}
          className="h-40 overflow-y-auto p-3 space-y-1 font-mono text-[11px]"
          style={{ scrollbarWidth: "thin" }}
        >
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-2 ${
              log.type === "error" ? "text-red-400"
              : log.type === "warn" ? "text-yellow-400"
              : log.type === "success" ? "text-green-400"
              : "text-gray-400"
            }`}>
              <span className="text-gray-600 shrink-0">[{fmt(log.time)}]</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Retry button */}
      {(timedOut || isWarning) && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/50 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Builder: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Timer & logs
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const chatRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((msg: string, type: LogEntry["type"] = "info") => {
    console.log(`[Builder][${type.toUpperCase()}] ${msg}`);
    setLogs((prev) => [...prev, { time: elapsed, msg, type }]);
    setTimeout(() => {
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight;
      }
    }, 50);
  }, [elapsed]);

  // Start/stop timer when generating changes
  useEffect(() => {
    if (generating) {
      setElapsed(0);
      setTimedOut(false);
      pollCountRef.current = 0;
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next === TIMEOUT_WARN) {
            console.warn("[Builder] Generation taking longer than expected:", next, "s");
          }
          if (next >= TIMEOUT_HARD) {
            setTimedOut(true);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [generating]);

  // ── Fetch project ──────────────────────────────────────────────────────────

  const fetchProject = useCallback(
    async (silent = false) => {
      if (!projectId) return;
      if (!silent) setLoading(true);
      try {
        pollCountRef.current += 1;
        const pollNum = pollCountRef.current;

        if (silent) {
          console.log(`[Builder] Poll #${pollNum} — checking generation status...`);
        }

        const { data } = await api.get<{ project: Project }>(
          `/api/user/project/${projectId}`
        );
        setProject(data.project);

        if (!data.project.current_code) {
          setGenerating(true);
          if (silent) {
            addLog(`Poll #${pollNum} — still generating, no code yet`, "info");
          }
        } else {
          const wasGenerating = generating;
          setGenerating(false);
          setTimedOut(false);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          if (wasGenerating || silent) {
            addLog(`Code ready! ${data.project.current_code.length} chars received`, "success");
            console.log("[Builder] ✅ Generation complete. Code length:", data.project.current_code.length);
          }
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || error.message;
        addLog(`Poll failed: ${msg}`, "error");
        console.error("[Builder] ❌ Fetch error:", error);
        if (!silent) toast.error(msg);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [projectId, generating, addLog]
  );

  useEffect(() => {
    addLog("Project loaded, fetching data...", "info");
    fetchProject();
  }, []);

  // Poll while generating
  useEffect(() => {
    if (generating && !pollRef.current) {
      addLog(`Starting polling every ${POLL_INTERVAL / 1000}s...`, "info");
      pollRef.current = setInterval(() => fetchProject(true), POLL_INTERVAL);
    }
    if (!generating && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [generating, fetchProject]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [project?.conversation]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // ── Send revision ──────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!message.trim() || sending || generating) return;
    if (!session?.user) return toast.error("Please sign in");

    const trimmed = message.trim();
    setSending(true);
    setMessage("");
    setLogs([]);

    setProject((prev) =>
      prev ? {
        ...prev,
        conversation: [...prev.conversation, {
          id: Date.now().toString(),
          role: "user",
          content: trimmed,
          timestamp: new Date().toISOString(),
        }],
      } : prev
    );

    try {
      addLog("Sending revision request...", "info");
      await api.post(`/api/project/${projectId}/revision`, { message: trimmed });
      addLog("Revision request accepted, generation started", "success");
      setGenerating(true);
      if (!pollRef.current) {
        pollRef.current = setInterval(() => fetchProject(true), POLL_INTERVAL);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      addLog(`Request failed: ${msg}`, "error");
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetry = () => {
    setTimedOut(false);
    setElapsed(0);
    setLogs([]);
    pollCountRef.current = 0;
    addLog("Retrying — restarting polling...", "warn");
    fetchProject(true);
    if (!pollRef.current) {
      pollRef.current = setInterval(() => fetchProject(true), POLL_INTERVAL);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveCode = async () => {
    if (!project?.current_code) return;
    setSaving(true);
    try {
      await api.put(`/api/project/${projectId}/save`, { code: project.current_code });
      toast.success("Project saved!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Publish toggle ─────────────────────────────────────────────────────────

  const togglePublish = async () => {
    if (!project) return;
    setPublishing(true);
    try {
      await api.put(`/api/project/published/${projectId}`);
      const nowPublished = !project.isPublished;
      setProject((prev) => prev ? { ...prev, isPublished: nowPublished } : prev);
      toast.success(nowPublished ? "Project published!" : "Project unpublished");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setPublishing(false);
    }
  };

  // ── Rollback ───────────────────────────────────────────────────────────────

  const rollback = async (versionId: string) => {
    setRolling(true);
    try {
      await api.post(`/api/project/${projectId}/rollback/${versionId}`);
      await fetchProject(true);
      toast.success("Rolled back successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setRolling(false);
    }
  };

  // ── Copy / Download ────────────────────────────────────────────────────────

  const copyCode = () => {
    if (!project?.current_code) return;
    navigator.clipboard.writeText(project.current_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!project?.current_code) return;
    const blob = new Blob([project.current_code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Project not found.</p>
          <button onClick={() => navigate("/project")} className="text-purple-400 hover:underline text-sm">
            ← Back to projects
          </button>
        </div>
      </div>
    );
  }

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#030303] text-white flex flex-col overflow-hidden font-sans">
      {/* ── Top Bar ── */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-black/40 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/project")}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[160px] md:max-w-[240px]">
              {project.name}
            </p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              {generating ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400" />
                  <span className="text-purple-400">Generating... {fmt(elapsed)}</span>
                </>
              ) : timedOut ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  <span className="text-red-400">Timed out</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Ready
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center — device switcher */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(["desktop", "tablet", "phone"] as Device[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`p-2 rounded-lg transition-all ${
                device === d ? "bg-purple-500/30 text-purple-300" : "text-gray-500 hover:text-white"
              }`}
            >
              {d === "desktop" ? <Monitor className="w-4 h-4" />
                : d === "tablet" ? <Tablet className="w-4 h-4" />
                : <Smartphone className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCode((v) => !v)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showCode
                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Code
          </button>

          <button onClick={copyCode} disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button onClick={downloadCode} disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button onClick={saveCode} disabled={saving || !project.current_code}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button onClick={togglePublish} disabled={publishing || !project.current_code}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
              project.isPublished
                ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50"
            }`}
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : project.isPublished ? <Globe className="w-3.5 h-3.5" />
              : <GlobeLock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{project.isPublished ? "Published" : "Publish"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="w-80 shrink-0 border-r border-white/5 flex flex-col bg-black/20">
          <div className="flex border-b border-white/5 shrink-0">
            {(["chat", "versions"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "chat" ? "Chat" : "History"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "chat" ? (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
                  {project.conversation.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs leading-relaxed">
                      Your website is being generated.<br />
                      Ask me to make any changes once it's ready!
                    </div>
                  )}
                  {project.conversation.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/5 shrink-0">
                  {generating && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating... {fmt(elapsed)}
                    </div>
                  )}
                  <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/40 transition-colors">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={generating ? "Wait for generation to finish..." : "Ask for changes..."}
                      disabled={sending || generating}
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || sending || generating}
                      className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                    >
                      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 text-center">
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}
              >
                {project.versions.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-xs">No versions yet.</div>
                ) : (
                  [...project.versions].reverse().map((v) => (
                    <VersionItem
                      key={v.id}
                      version={v}
                      isCurrent={v.id === project.current_version_index}
                      onRollback={rollback}
                      rolling={rolling}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye className="w-3.5 h-3.5" />
              {showCode ? "Source Code" : "Live Preview"}
            </div>
            {project.current_code && (
              <button onClick={() => fetchProject(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[#060606]">
            {generating && !project.current_code ? (
              <GeneratingPanel
                elapsed={elapsed}
                logs={logs}
                logsRef={logsRef}
                onRetry={handleRetry}
                timedOut={timedOut}
              />
            ) : !project.current_code ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Code2 className="w-12 h-12" />
                <p className="text-sm">No code generated yet.</p>
              </div>
            ) : showCode ? (
              <div className="w-full h-full">
                <pre className="text-xs text-gray-300 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-auto h-full whitespace-pre-wrap font-mono leading-relaxed"
                  style={{ scrollbarWidth: "thin" }}>
                  {project.current_code}
                </pre>
              </div>
            ) : (
              <div
                className="transition-all duration-500 h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white"
                style={{ width: deviceWidth[device], maxWidth: "100%" }}
              >
                <iframe
                  key={project.current_version_index ?? project.current_code.length}
                  srcDoc={project.current_code}
                  title="Preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;