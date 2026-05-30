import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Monitor, Tablet, Smartphone, Code2, Eye,
  RotateCcw, Save, Globe, GlobeLock, Loader2,
  Sparkles, Check, Copy, Download, RefreshCw, ArrowLeft,
  Zap, AlertTriangle, X, Menu,
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
const EDIT_COST     = 5;

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet:  "768px",
  phone:   "390px",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const apiError = (error: any): string =>
  error?.response?.data?.error   ||
  error?.response?.data?.message ||
  error?.message                 ||
  "Unknown error";

// ─── Hooks ─────────────────────────────────────────────────────────────────────

function useInterval(fn: () => void, ms: number, active: boolean) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => fnRef.current(), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

function useScrollToBottom<T extends HTMLElement>(ref: React.RefObject<T | null>, deps: any[]) {
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Standalone sub-components (defined OUTSIDE Builder) ──────────────────────

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
    ))}
  </div>
);

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
  version: Version; isCurrent: boolean; onRollback: (id: string) => void; rolling: boolean;
}> = ({ version, isCurrent, onRollback, rolling }) => (
  <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
    isCurrent ? "border-purple-500/40 bg-purple-500/10" : "border-white/5 bg-white/[0.02] hover:border-white/10"
  }`}>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-white font-medium truncate">{version.description}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(version.timestamp).toLocaleString()}</p>
    </div>
    <div className="flex items-center gap-2 ml-2 shrink-0">
      {isCurrent ? (
        <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">Current</span>
      ) : (
        <button onClick={() => onRollback(version.id)} disabled={rolling}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
          {rolling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  </div>
);

// ─── Live Streaming Code Panel ─────────────────────────────────────────────────

interface LiveCodePanelProps {
  projectName: string;
  initialPrompt: string;
  generating: boolean;
}

const LiveCodePanel: React.FC<LiveCodePanelProps> = ({ projectName, initialPrompt, generating }) => {
  const [streamedCode, setStreamedCode]   = useState("");
  const [isStreaming,  setIsStreaming]     = useState(false);
  const [streamDone,   setStreamDone]     = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // Auto-scroll code panel as it streams
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [streamedCode]);

  // Start streaming whenever generating flips to true
  useEffect(() => {
    if (!generating) { setStreamedCode(""); setStreamDone(false); return; }

    let cancelled = false;
    setStreamedCode("");
    setStreamDone(false);
    setIsStreaming(true);

    (async () => {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            stream: true,
            system: `You are a world-class frontend developer. Generate a complete, beautiful, single-file HTML website.
Output ONLY raw HTML code — no explanation, no markdown fences, no preamble.
Start immediately with <!DOCTYPE html>.`,
            messages: [
              {
                role: "user",
                content: `Project: "${projectName}"\n\nRequirements: ${initialPrompt}\n\nGenerate the complete HTML website now.`,
              },
            ],
          }),
        });

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.delta?.text ?? parsed?.content_block?.text ?? "";
              if (delta && !cancelled) {
                setStreamedCode((prev) => prev + delta);
              }
            } catch { /* ignore malformed SSE chunks */ }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
      } finally {
        if (!cancelled) { setIsStreaming(false); setStreamDone(true); }
      }
    })();

    return () => { cancelled = true; };
  }, [generating, projectName, initialPrompt]);

  const lineCount = streamedCode.split("\n").length;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Code2 className="w-3.5 h-3.5" />
          <span>AI is writing code</span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-purple-400">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              live
            </span>
          )}
          {streamDone && <span className="text-green-400">done</span>}
        </div>
        <span className="text-[10px] text-gray-600 font-mono tabular-nums">
          {lineCount > 1 ? `${lineCount} lines` : ""}
        </span>
      </div>

      {/* Streamed code */}
      <div className="flex-1 relative overflow-hidden">
        {/* Glow backdrop when streaming */}
        {isStreaming && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to top, rgba(139,92,246,0.08) 0%, transparent 100%)",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {streamedCode ? (
          <pre
            ref={codeRef}
            className="h-full overflow-auto p-4 text-[11px] font-mono leading-relaxed text-gray-300 whitespace-pre-wrap"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* Line numbers + code */}
            {streamedCode.split("\n").map((line, i) => (
              <div key={i} className="flex gap-3 group">
                <span className="select-none text-gray-700 text-right shrink-0 w-8 tabular-nums">
                  {i + 1}
                </span>
                <span className={
                  line.startsWith("  ") ? "text-gray-300" :
                  line.startsWith("<") ? "text-purple-300" :
                  line.startsWith("//") || line.startsWith("/*") ? "text-gray-500 italic" :
                  "text-gray-300"
                }>
                  {line || " "}
                </span>
              </div>
            ))}
            {/* Blinking cursor while streaming */}
            {isStreaming && (
              <div className="flex gap-3">
                <span className="select-none text-gray-700 w-8 tabular-nums text-right">{lineCount + 1}</span>
                <motion.span
                  className="inline-block w-2 h-3.5 bg-purple-400 rounded-sm"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              </div>
            )}
          </pre>
        ) : (
          /* Waiting state — show placeholder skeleton lines */
          <div className="h-full p-4 space-y-2 overflow-hidden">
            {[...Array(18)].map((_, i) => (
              <motion.div
                key={i}
                className="h-3 rounded bg-white/5"
                style={{ width: `${30 + Math.sin(i * 1.7) * 25 + (i % 3) * 12}%` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Generating Panel (no timer) ───────────────────────────────────────────────

const GeneratingPanel: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
    <div className="relative">
      <div className="w-20 h-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
        <Sparkles className="w-9 h-9 text-purple-400" />
      </div>
      <motion.div className="absolute inset-0 rounded-3xl border border-purple-500/30"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }} />
    </div>
    <div className="text-center">
      <p className="text-white font-semibold mb-2">Building your website…</p>
      <p className="text-gray-500 text-xs">Check the Code tab to watch it being written live</p>
    </div>
    <div className="flex gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-purple-500"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </div>
  </div>
);

const CreditConfirmDialog: React.FC<{
  credits: number; onConfirm: () => void; onCancel: () => void;
}> = ({ credits, onConfirm, onCancel }) => {
  const insufficient = credits < EDIT_COST;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}>
        <motion.div
          className="relative bg-[#0e0e14] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}>
          <button onClick={onCancel} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${insufficient ? "bg-red-500/10 border border-red-500/20" : "bg-purple-500/10 border border-purple-500/20"}`}>
            {insufficient ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Zap className="w-5 h-5 text-purple-400" />}
          </div>
          <h3 className="text-white font-semibold text-sm mb-1">{insufficient ? "Not enough credits" : "This will use credits"}</h3>
          {insufficient ? (
            <p className="text-gray-400 text-xs leading-relaxed mb-5">
              You need <span className="text-white font-semibold">{EDIT_COST} credits</span> to make an edit, but you only have <span className="text-red-400 font-semibold">{credits}</span>.
            </p>
          ) : (
            <p className="text-gray-400 text-xs leading-relaxed mb-5">
              Making this edit will cost <span className="text-purple-300 font-semibold">{EDIT_COST} credits</span>. You currently have <span className="text-white font-semibold">{credits} credits</span> remaining.
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all">Cancel</button>
            {!insufficient && (
              <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all">
                Confirm · {EDIT_COST} credits
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CenteredScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">{children}</div>
);

const DeviceIcon: Record<Device, React.ReactNode> = {
  desktop: <Monitor className="w-4 h-4" />,
  tablet:  <Tablet  className="w-4 h-4" />,
  phone:   <Smartphone className="w-4 h-4" />,
};

// ─── Sidebar Panel ─────────────────────────────────────────────────────────────

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  project: Project;
  chatRef: React.RefObject<HTMLDivElement | null>;
  sending: boolean;
  generating: boolean;
  credits: number;
  message: string;
  setMessage: (m: string) => void;
  handleSendClick: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  rollback: (id: string) => void;
  rolling: boolean;
}

const SidebarPanel: React.FC<SidebarProps> = ({
  activeTab, setActiveTab, project, chatRef, sending, generating,
  credits, message, setMessage, handleSendClick, handleKeyDown,
  rollback, rolling,
}) => (
  <div className="flex flex-col h-full">
    {/* Tabs */}
    <div className="flex border-b border-white/5 shrink-0">
      {(["chat", "versions"] as Tab[]).map((tab) => (
        <button key={tab} onClick={() => setActiveTab(tab)}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === tab ? "text-purple-400 border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"
          }`}>
          {tab === "chat" ? "Chat" : "History"}
        </button>
      ))}
    </div>

    <AnimatePresence mode="wait">
      {activeTab === "chat" ? (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {project.conversation.length === 0 && (
              <div className="text-center py-8 text-gray-600 text-xs leading-relaxed">
                Your website is being generated.<br />Ask me to make any changes once it's ready!
              </div>
            )}
            {project.conversation.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {sending && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm"><TypingDots /></div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 shrink-0">
            {generating && (
              <div className="mb-2 flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Generating…</span>
              </div>
            )}
            {!generating && (
              <div className="mb-2 flex items-center gap-1.5 text-[10px] text-gray-500">
                <Zap className="w-3 h-3" />
                <span>Each edit costs <span className="text-purple-400 font-semibold">{EDIT_COST} credits</span></span>
                <span className="ml-auto">You have <span className={credits < EDIT_COST ? "text-red-400" : "text-white"}>{credits}</span></span>
              </div>
            )}
            <div className="flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/40 transition-colors">
              <textarea
                value={message} onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={generating ? "Wait for generation to finish…" : "Ask for changes…"}
                disabled={sending || generating} rows={2}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none disabled:opacity-50"
              />
              <button onClick={handleSendClick} disabled={!message.trim() || sending || generating}
                className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0">
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
          </div>
        </motion.div>
      ) : (
        <motion.div key="versions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
          {project.versions.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-xs">No versions yet.</div>
          ) : (
            [...project.versions].reverse().map((v) => (
              <VersionItem key={v.id} version={v}
                isCurrent={v.id === project.current_version_index}
                onRollback={rollback} rolling={rolling} />
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const Builder: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const [project,    setProject]    = useState<Project | null>(null);
  const [credits,    setCredits]    = useState<number>(0);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message,    setMessage]    = useState("");
  const [sending,    setSending]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rolling,    setRolling]    = useState(false);
  const [showCode,   setShowCode]   = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [device,     setDevice]     = useState<Device>("desktop");
  const [activeTab,  setActiveTab]  = useState<Tab>("chat");
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const chatRef = useRef<HTMLDivElement>(null);

  const fetchCredits = useCallback(async () => {
    try {
      const { data } = await api.get<{ credits: number }>("/api/user/credit");
      setCredits(data.credits ?? 0);
    } catch { /* silent */ }
  }, []);

  const fetchProject = useCallback(async (silent = false) => {
    if (!projectId) return;
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get<{ project: Project }>(`/api/user/project/${projectId}`);
      setProject(data.project);
      setGenerating(!data.project.current_code);
    } catch (error: any) {
      if (!silent) toast.error(apiError(error));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProject(); fetchCredits(); }, [fetchProject, fetchCredits]);
  useInterval(() => fetchProject(true), POLL_INTERVAL, generating);
  useScrollToBottom(chatRef, [project?.conversation, sending]);

  const handleSendClick = () => {
    if (!message.trim() || sending || generating) return;
    if (!session?.user) return void toast.error("Please sign in");
    setPendingMsg(message.trim());
  };

  const confirmSend = async () => {
    if (!pendingMsg) return;
    const trimmed = pendingMsg;
    setPendingMsg(null); setSending(true); setMessage("");
    setProject((prev) => prev ? {
      ...prev, conversation: [...prev.conversation, {
        id: Date.now().toString(), role: "user", content: trimmed, timestamp: new Date().toISOString(),
      }],
    } : prev);
    try {
      await api.post(`/api/project/edit/${projectId}`, { message: trimmed });
      setCredits((c) => Math.max(0, c - EDIT_COST));
      setGenerating(true);
      setShowPreview(true);
    } catch (error: any) {
      toast.error(apiError(error));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendClick(); }
  };

  const saveCode = async () => {
    if (!project?.current_code) return;
    setSaving(true);
    try { await api.put(`/api/project/${projectId}/save`, { code: project.current_code }); toast.success("Project saved!"); }
    catch (error: any) { toast.error(apiError(error)); }
    finally { setSaving(false); }
  };

  const togglePublish = async () => {
    if (!project) return;
    setPublishing(true);
    try {
      await api.put(`/api/project/published/${projectId}`);
      const nowPublished = !project.isPublished;
      setProject((prev) => prev ? { ...prev, isPublished: nowPublished } : prev);
      toast.success(nowPublished ? "Project published!" : "Project unpublished");
    } catch (error: any) { toast.error(apiError(error)); }
    finally { setPublishing(false); }
  };

  const rollback = async (versionId: string) => {
    setRolling(true);
    try { await api.post(`/api/project/${projectId}/rollback/${versionId}`); await fetchProject(true); toast.success("Rolled back!"); }
    catch (error: any) { toast.error(apiError(error)); }
    finally { setRolling(false); }
  };

  const copyCode = () => {
    if (!project?.current_code) return;
    navigator.clipboard.writeText(project.current_code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    if (!project?.current_code) return;
    const blob = new Blob([project.current_code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${project.name || "website"}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  // Shared sidebar props
  const sidebarProps: SidebarProps = {
    activeTab, setActiveTab, project: project!, chatRef, sending, generating,
    credits, message, setMessage, handleSendClick, handleKeyDown,
    rollback, rolling,
  };

  // ─── Loading / not found ──────────────────────────────────────────────────────

  if (loading) return (
    <CenteredScreen>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">Loading project…</p>
      </div>
    </CenteredScreen>
  );

  if (!project) return (
    <CenteredScreen>
      <div className="text-center">
        <p className="text-gray-400 mb-4">Project not found.</p>
        <button onClick={() => navigate("/project")} className="text-purple-400 hover:underline text-sm">← Back to projects</button>
      </div>
    </CenteredScreen>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#030303] text-white flex flex-col overflow-hidden font-sans">

      {pendingMsg !== null && (
        <CreditConfirmDialog credits={credits} onConfirm={confirmSend} onCancel={() => setPendingMsg(null)} />
      )}

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)} />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-80 bg-[#0a0a0f] border-r border-white/5 flex flex-col lg:hidden"
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
                <span className="text-sm font-semibold text-white">Panel</span>
                <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarPanel {...sidebarProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-4 shrink-0 bg-black/40 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setShowSidebar(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0">
            <Menu className="w-4 h-4" />
          </button>
          <button onClick={() => navigate("/project")}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[100px] sm:max-w-[160px] md:max-w-[240px]">{project.name}</p>
            <p className="text-[10px] flex items-center gap-1">
              {generating ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin text-purple-400" /><span className="text-purple-400">Generating…</span></>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /><span className="text-gray-500">Ready</span></>
              )}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
          {(["desktop", "tablet", "phone"] as Device[]).map((d) => (
            <button key={d} onClick={() => setDevice(d)}
              className={`p-2 rounded-lg transition-all ${device === d ? "bg-purple-500/30 text-purple-300" : "text-gray-500 hover:text-white"}`}>
              {DeviceIcon[d]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-bold ${
            credits < EDIT_COST ? "bg-red-500/10 border-red-500/20 text-red-400"
            : credits < 20 ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
            : "bg-purple-500/10 border-purple-500/20 text-purple-300"
          }`}>
            <Zap className="w-3.5 h-3.5" /><span>{credits}</span>
          </div>

          <button onClick={() => setShowPreview((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white transition-all">
            {showPreview ? <Code2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          <button onClick={() => setShowCode((v) => !v)}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              showCode ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }`}>
            <Code2 className="w-3.5 h-3.5" /><span>Code</span>
          </button>

          <button onClick={copyCode} disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button onClick={downloadCode} disabled={!project.current_code}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
            <Download className="w-3.5 h-3.5" />
          </button>

          <button onClick={saveCode} disabled={saving || !project.current_code}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button onClick={togglePublish} disabled={publishing || !project.current_code}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30 ${
              project.isPublished
                ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                : "bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50"
            }`}>
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : project.isPublished ? <Globe className="w-3.5 h-3.5" /> : <GlobeLock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{project.isPublished ? "Published" : "Publish"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-80 shrink-0 border-r border-white/5 flex-col bg-black/20">
          <SidebarPanel {...sidebarProps} />
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#050505]">

          {/* Mobile: chat view */}
          {!showPreview && (
            <div className="flex flex-col flex-1 overflow-hidden lg:hidden bg-[#0a0a0f]">
              <SidebarPanel {...sidebarProps} />
            </div>
          )}

          {/* Preview / Code area */}
          <div className={`flex-col flex-1 overflow-hidden ${!showPreview ? "hidden lg:flex" : "flex"}`}>

            {/* ── While generating: split view — live code on left, spinner on right ── */}
            {generating && !project.current_code ? (
              <div className="flex flex-1 overflow-hidden">
                {/* Live code stream — left 60% */}
                <div className="flex-1 border-r border-white/5 overflow-hidden bg-[#060606]">
                  <LiveCodePanel
                    projectName={project.name}
                    initialPrompt={project.initial_prompt}
                    generating={generating}
                  />
                </div>
                {/* Generating status — right 40% */}
                <div className="w-64 shrink-0 hidden md:flex flex-col items-center justify-center bg-[#050505]">
                  <GeneratingPanel />
                </div>
              </div>
            ) : (
              <>
                {/* Normal header bar */}
                <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Eye className="w-3.5 h-3.5" />
                    {showCode ? "Source Code" : "Live Preview"}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex md:hidden items-center gap-1">
                      {(["desktop", "tablet", "phone"] as Device[]).map((d) => (
                        <button key={d} onClick={() => setDevice(d)}
                          className={`p-1.5 rounded-lg transition-all ${device === d ? "bg-purple-500/30 text-purple-300" : "text-gray-500 hover:text-white"}`}>
                          {DeviceIcon[d]}
                        </button>
                      ))}
                    </div>
                    {project.current_code && (
                      <button onClick={() => fetchProject(true)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto flex items-start justify-center p-2 sm:p-4 bg-[#060606]">
                  {!project.current_code ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                      <Code2 className="w-12 h-12" />
                      <p className="text-sm">No code generated yet.</p>
                    </div>
                  ) : showCode ? (
                    <div className="w-full h-full">
                      <pre className="text-xs text-gray-300 bg-black/40 border border-white/5 rounded-2xl p-4 sm:p-6 overflow-auto h-full whitespace-pre-wrap font-mono leading-relaxed" style={{ scrollbarWidth: "thin" }}>
                        {project.current_code}
                      </pre>
                    </div>
                  ) : (
                    <div className="transition-all duration-500 h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white"
                      style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}>
                      <iframe
                        key={project.current_version_index ?? project.current_code.length}
                        srcDoc={project.current_code} title="Preview"
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;