"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function EnhancedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Floating particles - enhanced for mobile */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/15"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 80 + 10}px`,
            height: `${Math.random() * 80 + 10}px`,
          }}
          animate={{
            y: [0, Math.random() * 100 - 50],
            x: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() * 0.5 + 0.5],
            opacity: [0.1, 0.3],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Pulsing circles - enhanced for mobile */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`circle-${i}`}
          className="absolute rounded-full border border-primary/30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 30}px`,
            height: `${Math.random() * 150 + 30}px`,
          }}
          animate={{
            scale: [1, Math.random() * 0.5 + 1.5],
            opacity: [0.1, 0.4],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Animated beams - enhanced for mobile */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`beam-${i}`}
          className="absolute top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 300 + 100}px`,
            transformOrigin: 'left',
          }}
          animate={{
            x: [0, typeof window !== 'undefined' ? window.innerWidth : 1000],
            opacity: [0, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Additional mobile-friendly elements */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`mobile-${i}`}
          className="absolute rounded-full bg-primary/10 blur-sm"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 5}px`,
            height: `${Math.random() * 60 + 5}px`,
          }}
          animate={{
            y: [0, Math.random() * 60 - 30],
            x: [0, Math.random() * 60 - 30],
            scale: [1, Math.random() * 0.7 + 0.7],
            opacity: [0.1, 0.4],
          }}
          transition={{
            duration: Math.random() * 15 + 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}