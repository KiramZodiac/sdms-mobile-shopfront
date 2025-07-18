import React, { useState, useEffect } from "react";
import { Zap, Star, TrendingUp, Sparkles, Play, Award } from "lucide-react";

const StunningTopRatedBanner = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentGlow, setCurrentGlow] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGlow((prev) => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const glowColors = [
    "from-blue-500/20 to-purple-500/20",
    "from-emerald-500/20 to-cyan-500/20",
    "from-pink-500/20 to-orange-500/20",
    "from-violet-500/20 to-blue-500/20"
  ];

  return (
    <div className="relative w-full h-[160px] md:h-[200px] lg:h-[240px] overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${glowColors[currentGlow]} transition-all duration-1000`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-purple-500/20" />
      </div>

      {/* Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-white/50 rounded-full animate-pulse"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <a
        href="/top-products"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Explore top-rated electronics"
      >
        <div className="relative z-10 text-center px-4 md:px-8 transform transition-all duration-700 ease-out group-hover:scale-[1.02]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-black font-semibold text-xs md:text-sm rounded-full mb-2 shadow">
            <Award className="w-4 h-4" />
            <span>TOP RATED</span>
            <Star className="w-4 h-4 fill-current" />
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white leading-snug">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PREMIUM ELECTRONICS
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-white/80 mt-1 mb-3 max-w-xl mx-auto">
            Discover cutting-edge tech with unbeatable quality and support.
          </p>

          {/* CTA Button */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-sm md:text-base rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
            <Play className="w-4 h-4" />
            <span>SHOP NOW</span>
            <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Decorative Icons */}
        <Sparkles className="absolute top-4 right-4 w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: "3s" }} />
        <Sparkles className="absolute bottom-4 left-4 w-4 h-4 text-blue-400 animate-bounce" style={{ animationDelay: "0.5s" }} />
        <Zap className="absolute top-1/3 left-6 w-4 h-4 text-purple-400 animate-pulse" />
        <Zap className="absolute bottom-1/3 right-6 w-4 h-4 text-pink-400 animate-pulse" />

        {/* Hover Ripple */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
        </div>
      </a>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default StunningTopRatedBanner;
