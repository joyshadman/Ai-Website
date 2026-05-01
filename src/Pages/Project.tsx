import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Trash2,
  Edit3,
  Plus,
  Search,
  Filter,
  FolderOpen,
  Monitor,
  Tablet,
  Smartphone
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Btn from "../components/Btn.tsx";
import { dummyProjects } from "../assets/assets.ts";

interface ProjectData {
  id: string;
  title: string;
  date: string;
  status: 'Live' | 'Draft';
  image?: string;
  current_code?: string;
}

const SkeletonCard = () => (
  <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden h-[400px] animate-pulse">
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
  id, title, date, status, image, current_code, onDelete 
}) => (
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
        <iframe
          srcDoc={current_code}
          title={title}
          className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none border-none opacity-60 group-hover:opacity-80 transition-opacity"
          sandbox="allow-scripts allow-same-origin"
          style={{ transform: 'scale(0.25)' }}
        />
      ) : (
        <img
          src={image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=225&auto=format&fit=crop"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-80"
        />
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link to={`/view/${id}`} className="no-underline">
          <Btn variant="primary" size="sm" icon={Edit3}>Edit</Btn>
        </Link>
        <Btn variant="glass" size="sm" icon={ExternalLink} />
      </div>
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
            {title}
          </h3>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
          status === 'Live' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
        }`}>
          {status}
        </span>
      </div>
      <div className="flex gap-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <Btn 
          variant="ghost" 
          size="sm" 
          className="text-red-400 hover:bg-red-500/10 hover:text-red-300" 
          icon={Trash2} 
          onClick={() => onDelete(id)} 
        >
          Delete
        </Btn>
      </div>
    </div>
  </motion.div>
);

const ProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>("desktop");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const fetchProject = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProjects(dummyProjects);
    setLoading(false);
  };

  const deleteProject = async (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  useEffect(() => {
    fetchProject();
  }, []);

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
                placeholder="Search projects..."
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all w-64 text-sm"
              />
            </div>
            <Btn variant="secondary" icon={Plus} onClick={() => setIsSaving(true)}>
              {isSaving ? "Saving..." : "New Site"}
            </Btn>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <React.Fragment key="loading">
                {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
              </React.Fragment>
            ) : projects.length > 0 ? (
              <React.Fragment key="content">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    {...project} 
                    onDelete={deleteProject} 
                  />
                ))}

                <motion.button
                  whileHover={{ scale: 0.98 }}
                  onClick={() => navigate('/')}
                  className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center min-h-[400px] gap-4 hover:border-purple-500/30 hover:bg-white/[0.01] transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                    <Plus className="w-8 h-8 text-gray-500 group-hover:text-purple-400" />
                  </div>
                  <span className="text-gray-500 font-bold group-hover:text-purple-400">Generate New Project</span>
                </motion.button>
              </React.Fragment>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty"
                className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <FolderOpen className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No projects found</h2>
                <p className="text-gray-600 mb-8">Start by generating your first website.</p>
                <Btn variant="primary" icon={Plus} onClick={() => navigate('/')} size="lg">
                  Generate New Project
                </Btn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
