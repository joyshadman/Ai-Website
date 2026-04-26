import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  ShieldCheck, 
  HelpCircle 
} from "lucide-react";
import Btn from "../components/Btn.tsx";

// Define the shape of a pricing plan
interface PricingPlan {
  title: string;
  price: string;
  description?: string;
  features?: string[];
  variant?: "primary" | "secondary" | "outline" | "glass" | "ghost";
  isPopular?: boolean;
}

interface PricingCardProps extends PricingPlan {}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  description, 
  features, 
  variant, 
  isPopular 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative group p-8 rounded-[2.5rem] border transition-all duration-500 ${
      isPopular 
        ? "bg-white/[0.05] border-purple-500/50 shadow-[0_0_50px_-12px_rgba(168,85,247,0.3)]" 
        : "bg-white/[0.02] border-white/10 hover:border-white/20"
    }`}
  >
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
        Most Evolved
      </div>
    )}

    <div className="mb-8">
      <h3 className="text-2xl font-bold text-white mb-2">{title || "Plan Tier"}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description || "Plan details and limitations."}</p>
    </div>

    <div className="mb-8 flex items-baseline gap-1">
      <span className="text-5xl font-black text-white">${price || "0"}</span>
      <span className="text-gray-500 text-sm font-medium">/month</span>
    </div>

    <div className="space-y-4 mb-10">
      {features && features.length > 0 ? (
        features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">{feature}</span>
          </div>
        ))
      ) : (
        <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
          <p className="text-gray-600 text-xs italic">No features listed yet.</p>
        </div>
      )}
    </div>

    <Btn 
      variant={variant || "outline"} 
      fullWidth 
      size="lg"
      className={isPopular ? "shadow-lg shadow-purple-500/20" : ""}
    >
      Initialize {title}
    </Btn>
  </motion.div>
);

const Price: React.FC = () => {
  const [plans] = useState<PricingPlan[]>([
    {
      title: "Free Package",
      price: "0",
      description: "Perfect for exploring the neural workspace.",
      variant: "outline",
      features: ["1 AI Website", "Basic Analytics", "Community Support"]
    },
    {
      title: "Premium Package",
      price: "39",
      description: "The standard for professional creators.",
      variant: "secondary",
      isPopular: true,
      features: ["Unlimited Websites", "Advanced AI Training", "Priority Edge Hosting", "Custom Domains"]
    },
    {
      title: "Luxury Package",
      price: "99",
      description: "Unrestricted computational power.",
      variant: "outline",
      features: ["Everything in Premium", "Dedicated Neural Weights", "24/7 Core Team Access", "White-label Options"]
    }
  ]);

  return (
    <div className="min-h-screen bg-[#030303] text-white pt-32 pb-20 px-6 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent">
              Pricing <span className="text-purple-500">overview</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
              Select the computational power your vision requires. <br className="hidden md:block" />
              Scale your digital presence with neural precision.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, i) => (
            <PricingCard key={i} {...plan} />
          ))}
        </div>

        {/* FAQ/Trust Section */}
        <div className="max-w-4xl mx-auto pt-20 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Secure Deployment</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Every site generated is hosted on encrypted, edge-optimized servers with 99.9% uptime.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2">Need a Custom Hub?</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Looking for Enterprise-scale AI generation? Contact our core team for custom neural weights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Price;