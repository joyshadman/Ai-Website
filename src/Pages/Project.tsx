import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, Trash2, Edit3, Plus, Search,
  FolderOpen, Globe, GlobeLock, Loader2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Btn from "../components/Btn.tsx";
import api from "@/configs/axios.ts";
import { toast } from "sonner";

interface ProjectData {
  id: string;
  name: string;
  updatedAt: string;
  isPublished: boolean;
  current_code?: string | null;
}

const SkeletonCard = () => (
  <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden h-[380px] animate-pulse">
    <div className="aspect-video w-full bg-white/5" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2 w-full">
          <div className="h-6 bg-white/10 rounded-md w-3/4" />
          <div className="h-4 bg-white/5 rounded-md w-1/4" />
        </div>
        <div className="h-6 bg-white/10 rounded-full w-12" />
      </div>
      <div className="pt-4 border-t border-white/5">
        <div className="h-8 bg-white/5 rounded-xl w-24" />
      </div>
    </div>
  </div>
);

const ProjectCard: React.FC<ProjectData & { onDelete: (id: string) => void }> = ({
  id: projectId, name, updatedAt, isPublished, current_code, onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setShowConfirm(false);
    try {
      await api.delete(`/api/project/${projectId}`);
      onDelete(projectId);
      toast.success("Project deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      setDeleting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-7 w-[320px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white text-lg font-bold text-center mb-2">
                Delete project?
              </h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
                This will permanently delete{" "}
                <span className="text-gray-300 font-semibold">{name}</span>{" "}
                and all its versions. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {deleting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group relative backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
      >
        <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent opacity-60 z-10" />

          {current_code ? (
            <div className="absolute inset-0 overflow-hidden">
              <iframe
                srcDoc={current_code}
                title={name}
                sandbox="allow-scripts"
                className="border-none pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity"
                style={{
                  width: "200%",
                  height: "200%",
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
              <div className="flex flex-col items-center gap-2 text-gray-700">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">Generating...</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link to={`/project/${projectId}`} className="no-underline">
              <Btn variant="primary" size="sm" icon={Edit3}>Edit</Btn>
            </Link>
            {current_code && (
              <Link to={`/preview/${projectId}`} className="no-underline">
                <Btn variant="glass" size="sm" icon={ExternalLink} />
              </Link>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                {name}
              </h3>
              <p className="text-gray-500 text-sm">
                {new Date(updatedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`ml-2 shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1 ${isPublished
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
              }`}>
              {isPublished ? <Globe className="w-2.5 h-2.5" /> : <GlobeLock className="w-2.5 h-2.5" />}
              {isPublished ? "Live" : "Draft"}
            </span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

const ProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ projects: ProjectData[] }>("/api/user/projects");
      setProjects(data.projects ?? []);
    } catch (error: any) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter mb-4">
              My <span className="text-purple-500">Creations.</span>
            </h1>
            <p className="text-gray-400 max-w-md">
              Manage, edit, and deploy your digital assets from one central workspace.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all w-64 text-sm text-white"
              />
            </div>
            <Btn variant="secondary" icon={Plus} onClick={() => navigate("/")}>
              New Site
            </Btn>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading
              ? [1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)
              : filtered.length > 0
                ? [
                  ...filtered.map((project) => (
                    <ProjectCard key={project.id} {...project} onDelete={handleDelete} />
                  )),
                  <motion.button
                    key="add-new"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => navigate("/")}
                    className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center min-h-[380px] gap-4 hover:border-purple-500/30 hover:bg-white/[0.01] transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                      <Plus className="w-8 h-8 text-gray-500 group-hover:text-purple-400" />
                    </div>
                    <span className="text-gray-500 font-bold group-hover:text-purple-400">
                      Generate New Project
                    </span>
                  </motion.button>,
                ]
                : [
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <FolderOpen className="w-10 h-10 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">
                      {search ? "No projects match your search" : "No projects yet"}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      {search ? "Try a different search term." : "Start by generating your first website."}
                    </p>
                    {!search && (
                      <Btn variant="primary" icon={Plus} onClick={() => navigate("/")} size="lg">
                        Generate New Project
                      </Btn>
                    )}
                  </motion.div>,
                ]}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;