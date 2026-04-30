import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { dummyProjects } from "../assets/assets.ts";

interface CommunityPost {
  id: string;
  author?: string;
  prompt?: string;
  likes?: number;
  shares?: number;
  image?: string;
  tags?: string[];
  current_code?: string;
}

const SkeletonCard = () => (
  <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden h-[450px] animate-pulse">
    <div className="aspect-[4/5] w-full bg-white/5" />
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="h-4 bg-white/10 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-5/6" />
      </div>
      <div className="pt-4 border-t border-white/5 flex justify-between">
        <div className="h-4 bg-white/10 rounded w-16" />
        <div className="h-8 bg-white/10 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

const CommunityCard: React.FC<CommunityPost> = ({
  id,
  author,
  prompt,
  tags,
  current_code
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -5 }}
    className="group relative w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-indigo-700/30 hover:border-indigo-800/80"
  >
    <Link to={`/view/${project.id}`} target="_blank" className="block" key={Project.id}>
      
      <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
        {current_code ? (
          <iframe
            srcDoc={current_code}
            title={id}
            className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
            sandbox="allow-scripts allow-same-origin"
            style={{ transform: 'scale(0.25)' }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs font-mono">
            No Preview Available
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags?.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-purple-500/10 rounded text-[9px] font-bold text-purple-400 border border-purple-500/20 uppercase">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
          <span className="text-xs font-semibold text-white/70">{author}</span>
        </div>

        <p className="text-gray-400 text-[11px] italic line-clamp-2 leading-relaxed mb-4">
          "{prompt}"
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
        </div>
      </div>
    </Link>
  </motion.div>
);

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCommunityPosts = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const communityData: CommunityPost[] = dummyProjects.map((proj, index) => ({
      id: proj.id,
      author: ["Neural_Mind", "PixelWiz", "CyberArchitect", "DesignAI"][index % 4],
      prompt: proj.title + ": High-end glassy interface.",
      image: proj.image,
      current_code: proj.current_code,
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      tags: [proj.status, "AI-Gen"]
    }));

    setPosts(communityData);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">
              Neural <span className="text-purple-500">Showcase.</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              Discover and remix top AI-generated architectures.
            </p>
          </motion.div>
        </div>

        {/* Updated Grid to handle the w-72 cards better */}
        <div className="flex flex-wrap justify-center gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)
            ) : (
              posts.map((post) => (
                <CommunityCard key={post.id} {...post} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Community;