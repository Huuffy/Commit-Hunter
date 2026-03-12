// Background — fixed full-screen decorative layer with stars, fireflies,
// nebula clouds, orbital rings, and a mouse-following shooting star.

import React, { useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const Background = () => {
  // Refs used in rAF loop instead of state to avoid re-renders
  const mouseRef = useRef({ x: 0, y: 0 });      // Mouse position (center-relative)
  const posRef = useRef({ x: 0, y: 0 });         // Interpolated follower position
  const velocityRef = useRef({ x: 0, y: 0 });    // Per-frame velocity
  const rafId = useRef(null);                     // rAF handle for cleanup

  // DOM refs for direct style updates (no React reconciliation)
  const starContainerRef = useRef(null);
  const starTailRef = useRef(null);

  // Reset follower to screen center on mount
  useEffect(() => {
    posRef.current = { x: 0, y: 0 };
  }, []);

  // Track mouse position relative to viewport center
  useEffect(() => {
    const handleMouseMove = (e) => {
        const x = e.clientX - window.innerWidth / 2;
        const y = e.clientY - window.innerHeight / 2;
        mouseRef.current = { x, y };
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // rAF loop — lerps the star toward the cursor and adjusts tail visuals by speed
  useEffect(() => {
    const loop = () => {
        const ease = 0.08; // Lerp factor (lower = smoother lag)

        const dx = mouseRef.current.x - posRef.current.x;
        const dy = mouseRef.current.y - posRef.current.y;

        // Move toward mouse
        posRef.current.x += dx * ease;
        posRef.current.y += dy * ease;

        velocityRef.current = { x: dx * ease, y: dy * ease };

        const vx = velocityRef.current.x;
        const vy = velocityRef.current.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        
        // Rotate to face movement direction; skip when nearly still to avoid jitter
        let rotation = 0;
        if (speed > 0.1) {
            rotation = Math.atan2(vy, vx) * (180 / Math.PI);
        }

        // Tail stretches (0.5×–1.8×) and fades in based on speed
        const scaleX = Math.min(Math.max(0.5 + speed / 40, 0.5), 1.8);
        const opacity = Math.min(Math.max(speed / 3, 0), 1);

        // Apply transforms directly to DOM
        if (starContainerRef.current) {
            starContainerRef.current.style.transform = 
                `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) rotate(${rotation}deg)`;
        }

        if (starTailRef.current) {
            starTailRef.current.style.opacity = opacity;
            starTailRef.current.style.transform = `scaleX(${scaleX})`;
        }

        rafId.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Memoised random arrays — computed once, stable across re-renders

  // 100 twinkling stars with varied sizes
  const stars = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() > 0.9 ? 2.5 : Math.random() > 0.7 ? 1.5 : 1,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 5,
  })), []);

  // 15 drifting fireflies (blue/purple)
  const fireflies = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 3,
    duration: 8 + Math.random() * 8,
    delay: Math.random() * 5,
    color: Math.random() > 0.5 ? "#60a5fa" : "#a78bfa",
  })), []);

  // 15 ambient rising particles
  const particles = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 25 + Math.random() * 15,
    delay: Math.random() * 15,
  })), []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep-space gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, #050510 0%, #0a0a20 20%, #1a103d 50%, #2d1b4e 75%, #1a1a2e 100%)",
        }}
      />

      {/* Tail sparkle keyframe */}
      <style>{`
          @keyframes tail-sparkle {
              0% { transform: translateX(0); opacity: 1; }
              100% { transform: translateX(-20px); opacity: 0; }
          }
      `}</style>
      
      {/* Shooting star — positioned at viewport center, moved via JS translate3d */}
      <div
          ref={starContainerRef}
          className="absolute top-1/2 left-1/2 z-50 pointer-events-none will-change-transform"
          style={{
              width: 0, 
              height: 0,
          }}
      >
          {/* Zero-size anchor for the star head + tail */}
          <div className="relative flex items-center justify-end w-0 h-0">
              
              {/* Glowing cyan star head */}
              <div className="relative w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] z-20 -translate-y-1/2 -translate-x-1/2">
                  <div className="absolute inset-0 bg-white blur-[1px] rounded-full" />
              </div>

              {/* Comet tail — stretches/fades by speed (core streak + outer glow + sparkle) */}
              <div 
                  ref={starTailRef}
                  className="absolute right-1 h-8 flex items-center justify-end origin-right -translate-y-1/2"
                  style={{ 
                      width: '4rem',
                  }}
              >
                  {/* Core streak */}
                  <div className="w-full h-0.5 bg-linear-to-l from-cyan-300 via-blue-500 to-transparent blur-[1px]" />
                  
                  {/* Outer glow */}
                  <div className="absolute right-0 w-3/4 h-4 bg-linear-to-l from-blue-500/50 via-purple-500/30 to-transparent blur-[6px] rounded-l-full" />
                  
                  {/* Looping sparkle particle */}
                  <div
                      className="absolute right-4 w-1 h-1 bg-cyan-200 rounded-full blur-[0.5px]"
                      style={{ animation: 'tail-sparkle 0.5s infinite linear' }}
                  />
              </div>
          </div>
      </div>

      {/* Nebula clouds — large blurred gradients that drift slowly */}
      <motion.div 
        className="absolute top-0 -left-1/4 w-200 h-200 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(19,92,246,0.4) 0%, rgba(88,28,135,0.2) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute -bottom-1/4 -right-1/4 w-175 h-175 rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(30,64,175,0.2) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      {/* Twinkling stars — opacity pulses at random phases */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* Fireflies — glowing dots drifting in small organic loops */}
      <div className="absolute inset-0">
        {fireflies.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{ y: [0, -20, 5, -10, 0], x: [0, 10, -8, 5, 0], opacity: [0.4, 0.7, 0.5, 0.8, 0.4] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay, ease: "linear" }}
          />
        ))}
      </div>

      {/* Orbital rings — two concentric circles rotating in opposite directions */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 opacity-10">
        <motion.div 
          className="absolute inset-0 border border-purple-500/40 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        />
         <motion.div 
          className="absolute inset-20 border border-blue-500/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Vignette — inset shadow darkening viewport edges */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]" />
    </div>
  )
}

export default Background