"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useWindowSize } from "@/hooks/use-mobile";

// Enhanced professional element counts
const ELEMENT_COUNTS = {
  mobile: {
    particles: 6,
    circles: 4,
    beams: 2,
    geometric: 4,
    stars: 3
  },
  desktop: {
    particles: 12,
    circles: 6,
    beams: 4,
    geometric: 8,
    stars: 6
  }
};

export function EnhancedBackground() {
  const [mounted, setMounted] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : false;
  
  const counts = isMobile ? ELEMENT_COUNTS.mobile : ELEMENT_COUNTS.desktop;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize element arrays
  const particleElements = useMemo(() => 
    [...Array(counts.particles)].map((_, i) => i), 
    [counts.particles]
  );
  
  const circleElements = useMemo(() => 
    [...Array(counts.circles)].map((_, i) => i), 
    [counts.circles]
  );
  
  const beamElements = useMemo(() => 
    [...Array(counts.beams)].map((_, i) => i), 
    [counts.beams]
  );
  
  const geometricElements = useMemo(() => 
    [...Array(counts.geometric)].map((_, i) => i), 
    [counts.geometric]
  );
  
  const starElements = useMemo(() => 
    [...Array(counts.stars)].map((_, i) => i), 
    [counts.stars]
  );

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Premium gradient background - Corporate blue/gold theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      
      {/* Subtle diamond pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(45deg, #2563eb 1px, transparent 1px),
                            linear-gradient(-45deg, #2563eb 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Accent gradient orbs - professional glowing effect */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-100/30 to-indigo-100/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-amber-50/20 to-yellow-50/10 blur-3xl" />
      
      {/* Animated connection lines - representing networks */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {beamElements.map((i) => {
          const x1 = Math.random() * 100;
          const y1 = Math.random() * 100;
          const x2 = x1 + (Math.random() * 40 - 20);
          const y2 = y1 + (Math.random() * 40 - 20);
          
          return (
            <motion.line
              key={`connector-${i}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#line-gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>
      
      {/* Floating geometric shapes - clean and professional */}
      {geometricElements.map((i) => {
        const size = Math.random() * 40 + 20;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const rotation = Math.random() * 360;
        
        return (
          <motion.div
            key={`geometric-${i}`}
            className="absolute border border-blue-200/30"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              rotate: `${rotation}deg`,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 40 - 20],
              rotate: [rotation, rotation + 180],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        );
      })}
      
      {/* Pulsing success circles - subtle and elegant */}
      {circleElements.map((i) => {
        const size = Math.random() * 80 + 40;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        
        return (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full border border-blue-300/20"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
      
      {/* Sparkling success stars */}
      {starElements.map((i) => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        
        return (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-amber-400 rounded-full"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
      
      {/* Animated data flow lines */}
      {beamElements.map((i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          style={{
            top: `${Math.random() * 100}%`,
            left: `-100px`,
            width: `${Math.random() * 300 + 200}px`,
          }}
          animate={{
            x: ['0%', '120vw'],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
      
      {/* Subtle grid overlay for structure */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #2563eb 1px, transparent 1px),
            linear-gradient(180deg, #2563eb 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Light gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-blue-50/20" />
    </div>
  );
}
