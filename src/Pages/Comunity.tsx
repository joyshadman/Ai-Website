import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Eye,
  Search,
  Filter,
  Globe,
  Heart,
  User,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import Btn from "../components/Btn.tsx";
import { dummyProjects } from "../assets/assets.ts";

interface CommunityProject {
  id: string;
  title: string;
  author: string;
  likes: number;
  views: string;
  status: 'Live' | 'Featured';
  image?: string;
  current_code?: string;
}

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

const CommunityCard: React.FC<CommunityProject> = ({ 
  id, title, author, likes, views, status, image, current_code 
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
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
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-70"
        />
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Link to={`/preview/${id}`} className="no-underline">
          <Btn variant="primary" size="sm" icon={Eye}>View Build</Btn>
        </Link>
        <Btn variant="glass" size="sm" icon={ExternalLink} />
      </div>

      {status === 'Featured' && (
        <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-full bg-purple-500 text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg shadow-purple-500/20">
          <Sparkles className="w-3 h-3" /> Featured
        </div>
      )}
    </div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-2.5 h-2.5" />
            </div>
            <span className="hover:text-white transition-colors cursor-pointer">{author}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Heart className="w-3.5 h-3.5 hover:text-red-500 cursor-pointer transition-colors" />
                <span>{likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <Eye className="w-3.5 h-3.5" />
                <span>{views}</span>
            </div>
        </div>
        <div className="text-[10px] font-bold text-purple-400/80 uppercase tracking-widest flex items-center gap-1">
            <Globe className="w-3 h-3" /> Public
        </div>
      </div>
    </div>
  </motion.div>
);

const Community: React.FC = () => {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCommunityProjects = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Ensure dummyProjects exists before mapping
      const communityData: CommunityProject[] = (dummyProjects || []).map(p => ({
        ...p,
        author: p.author || "Apex User",
        likes: p.likes ?? Math.floor(Math.random() * 500),
        views: p.views ?? (Math.random() * 5).toFixed(1) + "k",
        status: p.status ?? (Math.random() > 0.8 ? 'Featured' : 'Live')
      }));

      setProjects(communityData);
      setLoading(false);
    };

    fetchCommunityProjects();
  }, []);

  // DRY & Safe Filtering: useMemo prevents the "toLowerCase" crash on undefined
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => 
      p?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto mt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4 text-purple-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                <TrendingUp className="w-4 h-4" /> Global Showcase
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 italic">
              Neural <span className="text-purple-500">Showcase.</span>
            </h1>
            <p className="text-gray-400 max-w-lg leading-relaxed">
              Explore high-end digital experiences architected by the community using our neural engine.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all w-full md:w-72 text-sm backdrop-blur-md"
              />
            </div>
            <Btn variant="secondary" icon={Filter} />
          </motion.div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // FIX: Removed keyed React.Fragment to fix 'ref' warning
              [1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={`skeleton-${n}`} />)
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <CommunityCard key={project.id} {...project} />
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
                <h2 className="text-2xl font-bold text-gray-400 mb-2">The world is quiet...</h2>
                <p className="text-gray-600">No projects match your search criteria.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Community;