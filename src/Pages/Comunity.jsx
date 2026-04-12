import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  TrendingUp, 
  Layers, 
  Search, 
  Zap,
  Globe
} from "lucide-react";
import Btn from "../components/Btn";
import Navbar from "../components/Navbar";

const CommunityCard = ({ author, prompt, likes, shares, image, tags }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="group backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
  >
    {/* Visual Preview */}
    <div className="aspect-[4/5] bg-[#0a0a0a] overflow-hidden relative">
      <img 
        src={image || "/api/placeholder/400/500"} 
        alt="Template Preview" 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105"
      />
      <div className="absolute top-4 left-4 flex gap-2">
        {tags?.map(tag => (
          <span key={tag} className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-purple-400 border border-purple-500/20">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Content */}
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
        <span className="text-sm font-semibold text-white/80">{author || "Neural Designer"}</span>
      </div>
      
      <p className="text-gray-400 text-sm italic mb-6 line-clamp-2">
        "{prompt || "No prompt provided for this generation."}"
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-4 text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-bold">{likes || 0}</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-bold">{shares || 0}</span>
          </button>
        </div>
        <Btn variant="glass" size="sm" icon={Zap}>Remix</Btn>
      </div>
    </div>
  </motion.div>
);

const Community = () => {
  // Keeping it blank for your custom data
  const [posts, setPosts] = useState([]);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Users className="w-3 h-3" />
              Social Engine
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
              Neural <span className="text-purple-500 font-outline">Showcase.</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore the frontiers of AI web design. Browse the most popular 
              generations, remix prompts, and share your vision with the world.
            </p>
          </motion.div>

          {/* Search & Action Bar */}
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
                placeholder="Search templates or prompts..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <Btn variant="primary" icon={TrendingUp}>Trending</Btn>
              <Btn variant="glass" icon={Layers}>Newest</Btn>
            </div>
          </motion.div>
        </div>

        {/* Community Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <CommunityCard key={i} {...post} />
            ))
          ) : (
            /* Blank State */
            <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-8 rotate-12">
                <Globe className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-black text-white/40 mb-3 tracking-tighter">Quiet in the hub...</h2>
              <p className="text-gray-600 mb-10 text-center max-w-sm">
                No one has published a template yet. Be the first to share your AI generation with the community!
              </p>
              <Btn variant="secondary" size="lg" icon={Share2}>Publish Template</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;