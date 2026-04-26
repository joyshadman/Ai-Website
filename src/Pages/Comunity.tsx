import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  Share2,
  TrendingUp,
  Layers,
  Search,
  Zap,
  Globe,
  ExternalLink,
  Filter,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Btn from "../components/Btn.tsx";
import { dummyProjects } from "../assets/assets.ts";

// Define the shape of a Community Post
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
  likes,
  shares,
  image,
  tags,
  current_code
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -5 }}
    className="group backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-500 shadow-2xl"
  >
    <div className="aspect-[16/10] bg-[#0a0a0a] overflow-hidden relative border-b border-white/5">
      {current_code ? (
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            srcDoc={current_code}
            title={id}
            className="w-[1200px] h-[1500px] origin-top-left border-none opacity-40 group-hover:opacity-60 transition-opacity"
            style={{ transform: 'scale(0.33)' }}
          />
        </div>
      ) : (
        <img
          src={image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400"}
          alt="Template Preview"
          className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-all duration-700 group-hover:scale-105"
        />
      )}

      <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
        {tags?.map(tag => (
          <span key={tag} className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-purple-400 border border-purple-500/20 uppercase tracking-tighter">
            {tag}
          </span>
        ))}
      </div>

  
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />
    </div>

    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20" />
        <span className="text-sm font-semibold text-white/80">{author}</span>
      </div>

      <p className="text-gray-400 text-sm italic mb-6 line-clamp-2 leading-relaxed">
        "{prompt}"
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-4 text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group/btn">
            <Heart className="w-4 h-4 group-hover/btn:fill-pink-500" />
            <span className="text-xs font-bold">{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold">{shares}</span>
          </button>
        </div>
        <Btn variant="ghost" size="sm" icon={ExternalLink} />
      </div>
    </div>
  </motion.div>
);

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCommunityPosts = async () => {
    setLoading(true);
    // Simulate network delay for the glassy skeleton effect
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Map dummyProjects into the Community architecture
    const communityData: CommunityPost[] = dummyProjects.map((proj, index) => ({
      id: proj.id,
      author: ["Neural_Mind", "PixelWiz", "CyberArchitect", "DesignAI"][index % 4],
      prompt: proj.title + ": A high-end glassy interface with animated motion components.",
      image: proj.image,
      current_code: proj.current_code,
      tags: [proj.status, "Modern", "AI-Gen"]
    }));

    setPosts(communityData);
    setLoading(false);
  };

  useEffect(() => {
    fetchCommunityPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Users className="w-3 h-3" />
              Social Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
              Neural <span className="text-purple-500">Showcase.</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore the frontiers of AI web design. Browse the most popular 
              generations, remix prompts, and share your vision.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all text-sm backdrop-blur-md"
              />
            </div>
            <div className="flex gap-3">
              <Btn variant="primary" icon={TrendingUp}>Trending</Btn>
              <Btn variant="glass" icon={Filter}>Filters</Btn>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <Btn variant="glass" size="sm" className="bg-purple-600/20 border-purple-500/50 text-purple-300">Discovery</Btn>
          <Btn variant="ghost" size="sm">Top Remixes</Btn>
          <Btn variant="ghost" size="sm">Staff Picks</Btn>
          <div className="ml-auto">
            <Btn variant="secondary" size="sm" icon={Plus} onClick={() => navigate('/')}>Publish</Btn>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <React.Fragment key="loading">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <SkeletonCard key={n} />)}
              </React.Fragment>
            ) : posts.length > 0 ? (
              <React.Fragment key="content">
                {posts.map((post) => (
                  <CommunityCard key={post.id} {...post} />
                ))}
              </React.Fragment>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01] backdrop-blur-sm"
              >
                <Globe className="w-12 h-12 text-purple-400 mb-8 rotate-12" />
                <h2 className="text-3xl font-black text-white/40 mb-3 tracking-tighter">Quiet in the hub...</h2>
                <Btn variant="secondary" size="lg" icon={Share2}>Publish Template</Btn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Community;