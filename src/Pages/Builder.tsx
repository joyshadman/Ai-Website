import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Monitor, Tablet, Smartphone, Code2, Eye,
  RotateCcw, Save, Globe, GlobeLock, Loader2,
  Sparkles, Check, Copy, Download, RefreshCw, ArrowLeft, Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import api from "@/configs/axios.ts";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

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
type Tab    = "chat" | "versions";

// ─── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL = 3000;
const TIMEOUT_HARD  = 180;

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet:  "768px",
  phone:   "390px",
};

// ─── Timer localStorage helpers ────────────────────────────────────────────────
// We persist { startedAt: number } so the elapsed time is always wall-clock
// accurate even after the user navigates away and comes back.

const timerKey = (projectId: string) => `builder_timer_${projectId}`;

function startPersistedTimer(projectId: string) {
  const existing = localStorage.getItem(timerKey(projectId));
  if (!existing) {
    localStorage.setItem(timerKey(projectId), JSON.stringify({ startedAt: Date.now() }));
  }
}

function clearPersistedTimer(projectId: string) {
  localStorage.removeItem(timerKey(projectId));
}

function getPersistedElapsed(projectId: string): number | null {
  const raw = localStorage.getItem(timerKey(projectId));
  if (!raw) return null;
  try {
    const { startedAt } = JSON.parse(raw) as { startedAt: number };
    return Math.floor((Date.now() - startedAt) / 1000);
  } catch {
    return null;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtTime = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

const apiError = (error: any): string =>
  error?.response?.data?.error   ||
  error?.response?.data?.message ||
  error?.message                 ||
  "Unknown error";

// ─── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Elapsed timer backed by localStorage so it survives navigation.
 * - On mount (generating=true): resumes from persisted startedAt, or starts fresh.
 * - When generating flips false: clears localStorage and resets to 0.
 */
function usePersistedTimer(projectId: string | undefined, generating: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    if (!generating) {
      clearPersistedTimer(projectId);
      setElapsed(0);
      return;
    }

    // Ensure a start timestamp exists (idempotent)
    startPersistedTimer(projectId);

    // Sync elapsed immediately, then tick every second
    setElapsed(getPersistedElapsed(projectId) ?? 0);
    const id = setInterval(() => {
      setElapsed(getPersistedElapsed(projectId) ?? 0);
    }, 1000);

    return () => clearInterval(id);
  }, [generating, projectId]);

  return elapsed;
}

/** Runs `fn` on an interval while `active`. Uses a ref so fn is always fresh. */
function useInterval(fn: () => void, ms: number, active: boolean) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => fnRef.current(), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

/** Auto-scrolls a ref to bottom whenever deps change. */
function useScrollToBottom<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  deps: any[],
) {
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const TypingDots: React.FC = () => (
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

// ─── Generating Panel ──────────────────────────────────────────────────────────

const GeneratingPanel: React.FC<{
  elapsed: number;
  timedOut: boolean;
}> = ({ elapsed, timedOut }) => (
  <div className="flex flex-col items-center justify-center h-full gap-6">
    {/* Icon */}
    {timedOut ? (
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <Clock className="w-9 h-9 text-red-400" />
      </div>
    ) : (
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
    )}

    {/* Title + timer */}
    <div className="text-center">
      <p className="text-white font-semibold mb-3">
        {timedOut ? "Generation timed out" : "Building your website..."}
      </p>
      <div className={`flex items-center justify-center gap-2 text-3xl font-mono font-bold tabular-nums ${
        timedOut ? "text-red-400" : "text-purple-300"
      }`}>
        <Clock className="w-6 h-6" />
        {fmtTime(elapsed)}
      </div>
      {timedOut && (
        <p className="text-gray-500 text-xs mt-3 max-w-xs">
          The model may be overloaded. Please try again later.
        </p>
      )}
    </div>

    {/* Progress dots — hidden when timed out */}
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
  </div>
);

// ─── Shared full-screen wrapper ────────────────────────────────────────────────

const CenteredScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#030303] flex items-center justify-center">
    {children}
  </div>
);

// ─── Device icon map ───────────────────────────────────────────────────────────

const DeviceIcon: Record<Device, React.ReactNode> = {
  desktop: <Monitor    className="w-4 h-4" />,
  tablet:  <Tablet     className="w-4 h-4" />,
  phone:   <Smartphone className="w-4 h-4" />,
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Builder: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate      = useNavigate();
  const { data: session } = authClient.useSession();

  const [project,    setProject]    = useState<Project | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [timedOut,   setTimedOut]   = useState(false);
  const [message,    setMessage]    = useState("");
  const [sending,    setSending]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rolling,    setRolling]    = useState(false);
  const [showCode,   setShowCode]   = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [device,     setDevice]     = useState<Device>("desktop");
  const [activeTab,  setActiveTab]  = useState<Tab>("chat");

  const chatRef = useRef<HTMLDivElement>(null);

  // Persisted timer — resumes correctly after navigation
  const elapsed = usePersistedTimer(projectId, generating);

  // Hard timeout at TIMEOUT_HARD seconds
  useEffect(() => {
    if (elapsed >= TIMEOUT_HARD) setTimedOut(true);
  }, [elapsed]);

  // ── Fetch project ────────────────────────────────────────────────────────────

  const fetchProject = useCallback(async (silent = false) => {
    if (!projectId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get<{ project: Project }>(`/api/user/project/${projectId}`);
      setProject(data.project);

      if (data.project.current_code) {
        // Build finished — clear timer from localStorage
        clearPersistedTimer(projectId);
        setGenerating(false);
        setTimedOut(false);
      } else {
        // Still building — ensure timer is persisted
        startPersistedTimer(projectId);
        setGenerating(true);
      }
    } catch (error: any) {
      if (!silent) toast.error(apiError(error));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectId]);

  // Initial load
  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Poll while generating and not timed out
  useInterval(() => fetchProject(true), POLL_INTERVAL, generating && !timedOut);

  // Auto-scroll chat
  useScrollToBottom(chatRef, [project?.conversation, sending]);

  // ── Send revision ────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!message.trim() || sending || generating) return;
    if (!session?.user) return toast.error("Please sign in");

    const trimmed = message.trim();
    setSending(true);
    setMessage("");

    // Optimistic user bubble
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
      await api.post(`/api/project/${projectId}/revision`, { message: trimmed });
      // Start a fresh timer for this new generation
      if (projectId) {
        clearPersistedTimer(projectId);
        startPersistedTimer(projectId);
      }
      setTimedOut(false);
      setGenerating(true);
    } catch (error: any) {
      toast.error(apiError(error));
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

  // ── CRUD actions ─────────────────────────────────────────────────────────────

  const saveCode = async () => {
    if (!project?.current_code) return;
    setSaving(true);
    try {
      await api.put(`/api/project/${projectId}/save`, { code: project.current_code });
      toast.success("Project saved!");
    } catch (error: any) {
      toast.error(apiError(error));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!project) return;
    setPublishing(true);
    try {
      await api.put(`/api/project/published/${projectId}`);
      const nowPublished = !project.isPublished;
      setProject((prev) => prev ? { ...prev, isPublished: nowPublished } : prev);
      toast.success(nowPublished ? "Project published!" : "Project unpublished");
    } catch (error: any) {
      toast.error(apiError(error));
    } finally {
      setPublishing(false);
    }
  };

  const rollback = async (versionId: string) => {
    setRolling(true);
    try {
      await api.post(`/api/project/${projectId}/rollback/${versionId}`);
      await fetchProject(true);
      toast.success("Rolled back successfully!");
    } catch (error: any) {
      toast.error(apiError(error));
    } finally {
      setRolling(false);
    }
  };

  const copyCode = () => {
    if (!project?.current_code) return;
    navigator.clipboard.writeText(project.current_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!project?.current_code) return;
    const blob = new Blob([project.current_code], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${project.name || "website"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading / not found ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <CenteredScreen>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <p className="text-gray-500 text-sm">Loading project…</p>
        </div>
      </CenteredScreen>
    );
  }

  if (!project) {
    return (
      <CenteredScreen>
        <div className="text-center">
          <p className="text-gray-400 mb-4">Project not found.</p>
          <button
            onClick={() => navigate("/project")}
            className="text-purple-400 hover:underline text-sm"
          >
            ← Back to projects
          </button>
        </div>
      </CenteredScreen>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#030303] text-white flex flex-col overflow-hidden font-sans">

      {/* ── Top Bar ── */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-black/40 backdrop-blur-xl">

        {/* Left: back + project name + status */}
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
            <p className="text-[10px] flex items-center gap-1">
              {generating ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400" />
                  <span className="text-purple-400 font-mono">{fmtTime(elapsed)}</span>
                </>
              ) : timedOut ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  <span className="text-red-400">Timed out</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  <span className="text-gray-500">Ready</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center: device switcher */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          {(["desktop", "tablet", "phone"] as Device[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`p-2 rounded-lg transition-all ${
                device === d ? "bg-purple-500/30 text-purple-300" : "text-gray-500 hover:text-white"
              }`}
            >
              {DeviceIcon[d]}
            </button>
          ))}
        </div>

        {/* Right: actions */}
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

          <button
            onClick={copyCode}
            disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={downloadCode}
            disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={saveCode}
            disabled={saving || !project.current_code}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={togglePublish}
            disabled={publishing || !project.current_code}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
              project.isPublished
                ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50"
            }`}
          >
            {publishing
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : project.isPublished
                ? <Globe    className="w-3.5 h-3.5" />
                : <GlobeLock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {project.isPublished ? "Published" : "Publish"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel ── */}
        <div className="w-80 shrink-0 border-r border-white/5 flex flex-col bg-black/20">

          {/* Tabs */}
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
              <motion.div
                key="chat"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Messages */}
                <div
                  ref={chatRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{ scrollbarWidth: "thin" }}
                >
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

                {/* Input area */}
                <div className="p-3 border-t border-white/5 shrink-0">
                  {generating && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating…</span>
                      <span className="font-mono ml-auto">{fmtTime(elapsed)}</span>
                    </div>
                  )}
                  <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/40 transition-colors">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={generating ? "Wait for generation to finish…" : "Ask for changes…"}
                      disabled={sending || generating}
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || sending || generating}
                      className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
                    >
                      {sending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Send    className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1.5 text-center">
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="versions"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-3 space-y-2"
                style={{ scrollbarWidth: "thin" }}
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

          {/* Preview toolbar */}
          <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye className="w-3.5 h-3.5" />
              {showCode ? "Source Code" : "Live Preview"}
            </div>
            {project.current_code && (
              <button
                onClick={() => fetchProject(true)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-[#060606]">
            {generating && !project.current_code ? (
              <GeneratingPanel elapsed={elapsed} timedOut={timedOut} />
            ) : !project.current_code ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Code2 className="w-12 h-12" />
                <p className="text-sm">No code generated yet.</p>
              </div>
            ) : showCode ? (
              <div className="w-full h-full">
                <pre
                  className="text-xs text-gray-300 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-auto h-full whitespace-pre-wrap font-mono leading-relaxed"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {project.current_code}
                </pre>
              </div>
            ) : (
              <div
                className="transition-all duration-500 h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white"
                style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
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