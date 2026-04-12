import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Trash2, Edit3, Plus, Search, Filter, FolderOpen } from "lucide-react";
import Btn from "../components/Btn";
import Navbar from "../components/Navbar";

const ProjectCard = ({ title, date, status, image }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group relative backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-purple-500/40 transition-all duration-500"
  >
    <div className="aspect-video w-full bg-[#0a0a0a] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent opacity-60 z-10" />
      <img 
        src={image || "/api/placeholder/400/225"} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-80"
      />
      <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Btn variant="primary" size="sm" icon={Edit3}>Edit</Btn>
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
      <div className="flex gap-2 pt-2 border-t border-white/5">
        <Btn variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-300" icon={Trash2}>
          Delete
        </Btn>
      </div>
    </div>
  </motion.div>
);

const Project = () => {
  // Empty array to start fresh
  const [projects, setProjects] = useState([]);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto mt-30">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl font-black tracking-tighter mb-4">
              My <span className="text-purple-500">Creations.</span>
            </h1>
            <p className="text-gray-400 max-w-md">
              Manage, edit, and deploy your AI-generated digital assets from one central workspace.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-purple-500/50 transition-all w-64 text-sm"
              />
            </div>
            <Btn variant="secondary" icon={Plus}>New Site</Btn>
          </motion.div>
        </div>

        {/* Filters Bar */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <Btn variant="glass" size="sm" className="bg-purple-600/20 border-purple-500/50 text-purple-300">All Projects</Btn>
          <Btn variant="ghost" size="sm">Recently Edited</Btn>
          <Btn variant="ghost" size="sm">Live Sites</Btn>
          <Btn variant="ghost" size="sm">Drafts</Btn>
          <div className="ml-auto">
            <Btn variant="ghost" size="sm" icon={Filter}>Filters</Btn>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length > 0 ? (
            projects.map((proj, i) => (
              <ProjectCard 
                key={i} 
                title={proj.title} 
                date={proj.date} 
                status={proj.status} 
              />
            ))
          ) : (
            /* Blank/Empty State UI */
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-400 mb-2">No projects found</h2>
              <p className="text-gray-600 mb-8">Start by generating your first AI-powered website.</p>
              <Btn variant="primary" icon={Plus} size="lg">Generate New Project</Btn>
            </div>
          )}

          {/* Persistent "Add New" Card if projects exist */}
          {projects.length > 0 && (
            <motion.button 
              whileHover={{ scale: 0.98 }}
              className="border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center min-h-[300px] gap-4 hover:border-purple-500/30 hover:bg-white/[0.01] transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                <Plus className="w-8 h-8 text-gray-500 group-hover:text-purple-400" />
              </div>
              <span className="text-gray-500 font-bold group-hover:text-purple-400">Generate New Project</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;