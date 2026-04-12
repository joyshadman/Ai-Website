import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Btn = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", // primary, secondary, glass, ghost, outline
  size = "md",       // sm, md, lg, xl
  className = "", 
  icon: Icon,        // Pass a Lucide icon component
  isLoading = false,
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  
  // Base Styles
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-2xl overflow-hidden active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Variant Styles
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    secondary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    glass: "backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20",
    outline: "bg-transparent border-2 border-white/20 text-white hover:border-purple-500/50 hover:text-purple-400",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  };

  // Size Styles
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? "w-full" : "w-auto"}
        ${className}
      `}
      {...props}
    >
      {/* Background Hover Glow Effect for Glass variant */}
      {variant === "glass" && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}

      <div className="flex items-center gap-2 relative z-10">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className={`${children ? "w-4 h-4" : "w-5 h-5"}`} />
        )}
        {children}
      </div>
    </motion.button>
  );
};

export default Btn;