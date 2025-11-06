"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useWindowSize } from "@/hooks/use-mobile";

// Reduced number of elements based on device type
const ELEMENT_COUNTS = {
  mobile: {
    particles: 8,
    circles: 5,
    beams: 3,
    mobileElements: 5
  },
  desktop: {
    particles: 15,
    circles: 8,
    beams: 5,
    mobileElements: 8
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

  // Memoize element arrays to prevent recreation on each render
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
  
  const mobileElements = useMemo(() => 
    [...Array(counts.mobileElements)].map((_, i) => i), 
    [counts.mobileElements]
  );

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Floating particles - reduced count and optimized */}
      {particleElements.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/15"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 40 + 5}px`,
            height: `${Math.random() * 40 + 5}px`,
          }}
          animate={{
            y: [0, Math.random() * 50 - 25],
            x: [0, Math.random() * 50 - 25],
            scale: [1, Math.random() * 0.3 + 0.7],
            opacity: [0.1, 0.25],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ))}
      
      {/* Pulsing circles - reduced count */}
      {circleElements.map((i) => (
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full border border-primary/30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
          }}
          animate={{
            scale: [1, Math.random() * 0.3 + 1.1],
            opacity: [0.1, 0.3],
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ))}
      
      {/* Animated beams - reduced count */}
      {beamElements.map((i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 200 + 50}px`,
            transformOrigin: 'left',
          }}
          animate={{
            x: [0, typeof window !== 'undefined' ? window.innerWidth : 1000],
            opacity: [0, 0.7],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: Math.random() * 3,
            ease: "linear",
          }}
          aria-hidden="true"
        />
      ))}
      
      {/* Additional mobile-friendly elements - reduced count */}
      {mobileElements.map((i) => (
        <motion.div
          key={`mobile-${i}`}
          className="absolute rounded-full bg-primary/10 blur-sm"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 30 + 3}px`,
            height: `${Math.random() * 30 + 3}px`,
          }}
          animate={{
            y: [0, Math.random() * 30 - 15],
            x: [0, Math.random() * 30 - 15],
            scale: [1, Math.random() * 0.5 + 0.6],
            opacity: [0.1, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}