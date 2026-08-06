import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Search,
  Filter,
  Globe,
  User,
  Sparkles,
  TrendingUp,
  X,
  Maximize2,
  Monitor,
  Smartphone,
} from "lucide-react";
import Btn from "../components/Btn.tsx";
import api from "@/configs/axios.ts";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityProject {
  id: string;
  name: string;
  isPublished: boolean;
  current_code?: string | null;
  user?: { name?: string; email?: string };
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authorOf = (user?: CommunityProject["user"]) =>
  user?.name || user?.email?.split("@")[0] || "Apex User";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden h-[420px] animate-pulse">
    <div className="aspect-video w-full bg-white/5" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2 w-full">
          <div className="h-6 bg-white/10 rounded-md w-3/4" />
          <div className="h-4 bg-white/5 rounded-md w-1/4" />
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 flex gap-2">
        <div className="h-8 bg-white/5 rounded-xl w-20" />
        <div className="h-8 bg-white/5 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

// ─── Preview Modal ────────────────────────────────────────────────────────────

interface PreviewModalProps {
  project: CommunityProject;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ project, onClose }) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    // Prevent body scroll while modal open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const iframeWidth = viewMode === "mobile" ? "390px" : "100%";

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          key="modal-panel"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="relative flex flex-col w-full max-w-7xl bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          style={{ height: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Modal toolbar ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0 bg-black/40">
            {/* Left: project info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-sm">
                  {project.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  by {authorOf(project.user)}
                </p>
              </div>
            </div>

            {/* Center: device switcher */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode("desktop")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "desktop"
                    ? "bg-purple-500/30 text-purple-300"
                    : "text-gray-500 hover:text-white"
                  }`}
                title="Desktop view"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "mobile"
                    ? "bg-purple-500/30 text-purple-300"
                    : "text-gray-500 hover:text-white"
                  }`}
                title="Mobile view"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/preview/${project.id}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all no-underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Preview area ── */}
          <div className="flex-1 overflow-hidden flex items-start justify-center bg-[#060606] p-4">
            {project.current_code ? (
              <div
                className="h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-white transition-all duration-500"
                style={{ width: iframeWidth, maxWidth: "100%" }}
              >
                <iframe
                  srcDoc={project.current_code}
                  title={project.name}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                <Globe className="w-12 h-12" />
                <p className="text-sm">No preview available.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Community Card ───────────────────────────────────────────────────────────

interface CommunityCardProps extends CommunityProject {
  onPreview: (project: CommunityProject) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = (props) => {
  const { name, current_code, user, updatedAt, onPreview } = props;
  const authorName = authorOf(user);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent opacity-60 z-10" />

        {current_code ? (
          <iframe
            srcDoc={current_code}
            title={name}
            className="absolute top-0 left-0 pointer-events-none border-none opacity-60 group-hover:opacity-80 transition-opacity"
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: "400%",
              height: "400%",
              transform: "scale(0.25)",
              transformOrigin: "top left",
            }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=225&auto=format&fit=crop"
            alt={name}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-opacity"
          />
        )}

        {/* Large clickable zone for modal — sits below the external link btn */}
        <button
          onClick={() => onPreview(props)}
          aria-label={`Preview ${name}`}
          className="absolute inset-0 z-20 w-full h-full cursor-pointer bg-transparent border-none"
        />

        {/* Hover hint label — pointer-events-none so clicks pass through to button above */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white text-sm font-semibold">
            <Maximize2 className="w-4 h-4" />
            Preview
          </div>
        </div>

        {/* External link — z-30 so it sits ABOVE the modal-trigger button */}


        {/* Featured badge */}
        <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-full bg-purple-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg shadow-purple-500/20">
          <Sparkles className="w-3 h-3" /> Featured
        </div>
      </div>

      {/* Card body — clicking text area also opens modal */}
      <div className="p-6 cursor-pointer" onClick={() => onPreview(props)}>
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="truncate">{authorName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <p className="text-[11px] text-gray-600">
            {new Date(updatedAt).toLocaleDateString()}
          </p>
          <div className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest flex items-center gap-1">
            <Globe className="w-3 h-3" /> Public
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const Community: React.FC = () => {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewProject, setPreviewProject] = useState<CommunityProject | null>(null);

  useEffect(() => {
    const fetchPublished = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{ projects: CommunityProject[] }>(
          "/api/project/published"
        );
        setProjects(data.projects);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublished();
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        p?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [projects, searchQuery]
  );

  const openPreview = useCallback((project: CommunityProject) => {
    setPreviewProject(project);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewProject(null);
  }, []);

  return (
    <>
      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewProject && (
          <PreviewModal project={previewProject} onClose={closePreview} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
        <div className="max-w-7xl mx-auto mt-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-4 text-purple-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                <TrendingUp className="w-4 h-4" /> Global Showcase
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 italic">
                Community <span className="text-purple-500">published.</span>
              </h1>
              <p className="text-gray-400 max-w-lg leading-relaxed">
                Explore high-end digital experiences architected by the community
                using our Ai.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all w-full md:w-72 text-sm backdrop-blur-md text-white"
                />
              </div>
              <Btn variant="secondary" icon={Filter} />
            </motion.div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={`skeleton-${n}`} />)
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <CommunityCard
                    key={project.id}
                    {...project}
                    onPreview={openPreview}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="empty"
                  className="col-span-full py-32 flex flex-col items-center justify-center border border-white/5 rounded-[3rem] bg-white/[0.01]"
                >
                  <Globe className="w-16 h-16 text-gray-700 mb-6" />
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">
                    {searchQuery ? "No results found" : "The world is quiet..."}
                  </h2>
                  <p className="text-gray-600">
                    {searchQuery
                      ? "Try a different search term."
                      : "No published projects yet. Be the first to publish!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Community;