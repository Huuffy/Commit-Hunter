import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreen = ({ isLoading, onLoadingComplete, minDuration = 3500 }) => {
  const [phase, setPhase] = useState("loading"); // loading -> opening -> reveal -> done
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setPhase("loading");
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, minDuration / 14);

      const loadTimer = setTimeout(() => setPhase("opening"), minDuration);
      const revealTimer = setTimeout(() => setPhase("reveal"), minDuration + 1200);
      const completeTimer = setTimeout(() => {
        setPhase("done");
        if (onLoadingComplete) onLoadingComplete();
      }, minDuration + 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(loadTimer);
        clearTimeout(revealTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isLoading, minDuration, onLoadingComplete]);

  // Magical particles (fireflies)
  const fireflies = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
    color: Math.random() > 0.5 ? "#60a5fa" : "#a78bfa",
  }));

  // Floating crystals
  const crystals = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.8,
    size: 20 + Math.random() * 40,
    rotation: Math.random() * 360,
  }));

  // Mystical fog particles
  const fogParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 100 + Math.random() * 200,
    opacity: 0.2 + Math.random() * 0.3,
  }));

  return (
    <AnimatePresence>
      {isLoading && phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-100 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Deep space/night sky background */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, #0a0a1a 0%, #1a103d 40%, #2d1b4e 70%, #1a1a2e 100%)",
            }}
          />

          {/* Stars layer */}
          <div className="absolute inset-0">
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: Math.random() > 0.9 ? 3 : Math.random() > 0.7 ? 2 : 1,
                  height: Math.random() > 0.9 ? 3 : Math.random() > 0.7 ? 2 : 1,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Nebula glow effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-1/4 w-150 h-150 bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-125 h-125 bg-blue-600/20 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-indigo-500/10 rounded-full blur-[80px]" />
          </div>

          {/* Fireflies/magical particles */}
          <div className="absolute inset-0 pointer-events-none">
            {fireflies.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px ${particle.color}`,
                }}
                animate={{
                  y: [0, -30, 0, 20, 0],
                  x: [0, 15, -10, 5, 0],
                  opacity: [0.4, 1, 0.6, 1, 0.4],
                  scale: [1, 1.3, 1, 1.2, 1],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Mystical fog when opening */}
          <AnimatePresence>
            {(phase === "opening" || phase === "reveal") && (
              <div className="absolute inset-0 z-5 pointer-events-none">
                {fogParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      bottom: "0%",
                      width: particle.size,
                      height: particle.size,
                      background: `radial-gradient(circle, rgba(147,112,219,${particle.opacity}) 0%, rgba(100,100,200,${particle.opacity * 0.5}) 40%, transparent 70%)`,
                      filter: "blur(30px)",
                    }}
                    initial={{ y: 100, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      y: [100, -200, -400],
                      opacity: [0, particle.opacity, 0],
                      scale: [0.5, 1.5, 2],
                    }}
                    transition={{ 
                      duration: 3,
                      delay: particle.delay,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Central magical burst */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 3], opacity: [0.8, 0] }}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  <div className="w-75 h-75 rounded-full bg-gradient-radial from-purple-400/40 via-blue-500/20 to-transparent blur-[60px]" />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Rising crystals when opening */}
          <AnimatePresence>
            {(phase === "opening" || phase === "reveal") && (
              <div className="absolute inset-0 z-6 pointer-events-none overflow-hidden">
                {crystals.map((crystal) => (
                  <motion.div
                    key={crystal.id}
                    className="absolute bottom-0"
                    style={{ left: `${crystal.x}%` }}
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: -100, opacity: [0, 1, 0.8] }}
                    transition={{ duration: 2, delay: crystal.delay, ease: "easeOut" }}
                  >
                    {/* Crystal shape */}
                    <div 
                      className="relative"
                      style={{ 
                        width: crystal.size, 
                        height: crystal.size * 2,
                        transform: `rotate(${crystal.rotation}deg)`,
                      }}
                    >
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(147,197,253,0.8) 0%, rgba(167,139,250,0.6) 50%, rgba(96,165,250,0.4) 100%)",
                          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                          filter: "drop-shadow(0 0 20px rgba(147,197,253,0.8))",
                        }}
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(225deg, rgba(255,255,255,0.4) 0%, transparent 50%)",
                          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Left Door - Mystical Gate */}
          <motion.div
            className="absolute left-0 top-0 w-1/2 h-full z-10"
            style={{
              background: "linear-gradient(to right, #0d0d1a 0%, #1a1a30 60%, #252545 100%)",
              boxShadow: "inset -30px 0 80px rgba(0,0,0,0.9)",
            }}
            initial={{ x: 0 }}
            animate={{ x: phase === "loading" ? 0 : "-100%" }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Mystical door decorations */}
            <div className="absolute inset-0">
              {/* Glowing vine/branch patterns */}
              <svg className="absolute right-0 top-0 h-full w-32 opacity-30" viewBox="0 0 100 400" preserveAspectRatio="none">
                <path d="M100,0 Q60,100 100,200 Q50,300 100,400" stroke="url(#vineGradient)" strokeWidth="2" fill="none"/>
                <path d="M100,50 Q70,150 100,250 Q60,350 100,400" stroke="url(#vineGradient)" strokeWidth="1" fill="none"/>
                <defs>
                  <linearGradient id="vineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Door edge glow */}
              <div className="absolute right-0 top-0 h-full w-0.75 bg-linear-to-b from-transparent via-purple-400/60 to-transparent" />
              
              {/* Mystical runes */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute right-8 w-6 h-6 rounded-full border border-purple-400/40"
                  style={{ top: `${20 + i * 15}%` }}
                  animate={{ 
                    boxShadow: ["0 0 10px rgba(167,139,250,0.3)", "0 0 20px rgba(167,139,250,0.6)", "0 0 10px rgba(167,139,250,0.3)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <div className="absolute inset-1 rounded-full bg-purple-500/20" />
                </motion.div>
              ))}

              {/* Glowing edge on opening */}
              <motion.div
                className="absolute right-0 top-0 h-full w-2"
                style={{ background: "linear-gradient(to bottom, transparent, #a78bfa, #60a5fa, #a78bfa, transparent)" }}
                animate={{ opacity: phase === "opening" ? [0.5, 1, 0.5] : 0.3 }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Right Door - Mystical Gate */}
          <motion.div
            className="absolute right-0 top-0 w-1/2 h-full z-10"
            style={{
              background: "linear-gradient(to left, #0d0d1a 0%, #1a1a30 60%, #252545 100%)",
              boxShadow: "inset 30px 0 80px rgba(0,0,0,0.9)",
            }}
            initial={{ x: 0 }}
            animate={{ x: phase === "loading" ? 0 : "100%" }}
            transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Mystical door decorations */}
            <div className="absolute inset-0">
              {/* Glowing vine/branch patterns */}
              <svg className="absolute left-0 top-0 h-full w-32 opacity-30" viewBox="0 0 100 400" preserveAspectRatio="none">
                <path d="M0,0 Q40,100 0,200 Q50,300 0,400" stroke="url(#vineGradient2)" strokeWidth="2" fill="none"/>
                <path d="M0,50 Q30,150 0,250 Q40,350 0,400" stroke="url(#vineGradient2)" strokeWidth="1" fill="none"/>
                <defs>
                  <linearGradient id="vineGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Door edge glow */}
              <div className="absolute left-0 top-0 h-full w-0.75 bg-linear-to-b from-transparent via-purple-400/60 to-transparent" />
              
              {/* Mystical runes */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-8 w-6 h-6 rounded-full border border-blue-400/40"
                  style={{ top: `${20 + i * 15}%` }}
                  animate={{ 
                    boxShadow: ["0 0 10px rgba(96,165,250,0.3)", "0 0 20px rgba(96,165,250,0.6)", "0 0 10px rgba(96,165,250,0.3)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                >
                  <div className="absolute inset-1 rounded-full bg-blue-500/20" />
                </motion.div>
              ))}

              {/* Glowing edge on opening */}
              <motion.div
                className="absolute left-0 top-0 h-full w-2"
                style={{ background: "linear-gradient(to bottom, transparent, #60a5fa, #a78bfa, #60a5fa, transparent)" }}
                animate={{ opacity: phase === "opening" ? [0.5, 1, 0.5] : 0.3 }}
                transition={{ duration: 0.4, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Center Content - Loading UI */}
          {phase === "loading" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
              {/* Mystical tree/orb */}
              <motion.div
                className="relative mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Outer glow rings */}
                <motion.div
                  className="absolute -inset-8 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)" }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Main orb */}
                <div className="relative w-32 h-32">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle at 30% 30%, rgba(147,197,253,0.9) 0%, rgba(167,139,250,0.7) 40%, rgba(99,102,241,0.5) 100%)",
                      boxShadow: "0 0 60px rgba(167,139,250,0.6), 0 0 100px rgba(96,165,250,0.4), inset 0 0 30px rgba(255,255,255,0.2)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  
                  {/* Inner crystal structure */}
                  <div className="absolute inset-4 rounded-full border border-white/30 backdrop-blur-sm" />
                  <div className="absolute inset-8 rounded-full bg-white/20" />
                  
                  {/* Orbiting particles */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-300 shadow-[0_0_15px_#93c5fd]" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_12px_#c4b5fd]" />
                  </motion.div>
                </div>

                {/* Butterfly silhouettes */}
                <motion.div
                  className="absolute -top-4 -right-8 text-2xl"
                  animate={{ 
                    y: [0, -10, 0],
                    x: [0, 5, 0],
                    rotate: [0, 10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 10px rgba(167,139,250,0.8))" }}
                >
                  🦋
                </motion.div>
              </motion.div>

              {/* Title */}
              <motion.h2 
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-purple-300 to-blue-300 mb-2 tracking-wider"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                BEYOND THE ASCENSION
              </motion.h2>
              <p className="text-purple-300/60 text-sm tracking-[0.3em] mb-8">
                ENTERING THE UNKNOWN
              </p>

              {/* Progress bar */}
              <div className="w-64 md:w-80">
                <div className="h-1.5 bg-purple-900/30 rounded-full overflow-hidden backdrop-blur border border-purple-500/20">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #60a5fa, #a78bfa, #818cf8, #a78bfa, #60a5fa)",
                      backgroundSize: "200% 100%",
                    }}
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: `${Math.min(progress, 100)}%`,
                      backgroundPosition: ["0% 0%", "100% 0%"],
                    }}
                    transition={{ 
                      width: { duration: 0.3 },
                      backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                    }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs">
                  <span className="text-purple-400/60 tracking-widest">AWAKENING</span>
                  <span className="text-blue-300 font-mono">{Math.min(Math.round(progress), 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
