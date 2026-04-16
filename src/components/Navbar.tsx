import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "../assets/Ai-logo.png";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-xl bg-black/40 border border-white/10 p-4 rounded-2xl shadow-2xl"
      >
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="h-10 w-10 rounded-full overflow-hidden">
            <img 
              src={Logo} 
              alt="Apexium Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">
            Apexium AI<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-white transition-colors duration-300 relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/project" className="hover:text-white transition-colors duration-300 relative group">
            My Projects
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/comunity" className="hover:text-white transition-colors duration-300 relative group">
            Community
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/price" className="hover:text-white transition-colors duration-300 relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all shadow-lg shadow-white/5"
        >
          Start Building
        </motion.button>
      </motion.div>
    </nav>
  );
};

export default Navbar;