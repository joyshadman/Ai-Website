import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react"; 
import Logo from "../assets/Ai-logo.png";
import Btn from "./Btn"; 

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "My Projects", path: "/project" },
    { name: "Community", path: "/comunity" },
    { name: "Pricing", path: "/price" },
  ];

  const menuVariants = {
    closed: { opacity: 0, y: -20, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-4 py-4 md:px-6 md:py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-xl bg-black/40 border border-white/10 p-4 rounded-2xl shadow-2xl relative z-50"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10">
            <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-bold text-xl md:text-2xl tracking-tight">
            Apexium AI<span className="text-purple-500">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="hover:text-white transition-colors duration-300 relative group">
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Desktop CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Btn variant="primary" size="sm" onClick={() => navigate("/auth/signin")}>
              Sign Up / Login
            </Btn>
          </div>

          {/* Hamburger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-24 left-4 right-4 md:hidden backdrop-blur-2xl bg-black/90 border border-white/10 p-8 rounded-3xl shadow-3xl z-40"
          >
            <div className="flex flex-col gap-8 items-center text-center">
              {navLinks.map((link) => (
                <motion.div key={link.name} variants={menuVariants}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-bold text-white hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={menuVariants} className="w-full pt-4 border-t border-white/10">
                <Btn 
                  variant="primary" 
                  fullWidth 
                  size="lg"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/auth/signin");
                  }}
                >
                  Sign Up / Login
                </Btn>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;