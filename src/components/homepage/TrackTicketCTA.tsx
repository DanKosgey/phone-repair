"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileSearch, Zap, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useFeatureToggle } from "@/hooks/use-feature-toggle";

// Predefined positions to avoid hydration issues
const PARTICLES = [
  { top: "10%", left: "5%", size: "15px" },
  { top: "20%", left: "80%", size: "20px" },
  { top: "30%", left: "15%", size: "12px" },
  { top: "40%", left: "70%", size: "25px" },
  { top: "50%", left: "25%", size: "18px" },
  { top: "60%", left: "85%", size: "14px" },
  { top: "70%", left: "35%", size: "22px" },
  { top: "80%", left: "60%", size: "16px" },
  { top: "85%", left: "10%", size: "19px" },
  { top: "90%", left: "75%", size: "13px" },
  { top: "15%", left: "40%", size: "17px" },
  { top: "25%", left: "85%", size: "21px" },
  { top: "35%", left: "20%", size: "11px" },
  { top: "45%", left: "65%", size: "23px" },
  { top: "55%", left: "30%", size: "15px" },
  { top: "65%", left: "75%", size: "18px" },
  { top: "75%", left: "45%", size: "20px" },
  { top: "85%", left: "5%", size: "14px" },
  { top: "95%", left: "60%", size: "16px" },
  { top: "5%", left: "50%", size: "12px" },
];

// Predefined beam positions
const BEAMS = [
  { top: "10%", left: "0%", width: "200px" },
  { top: "25%", left: "0%", width: "250px" },
  { top: "40%", left: "0%", width: "180px" },
  { top: "55%", left: "0%", width: "300px" },
  { top: "70%", left: "0%", width: "220px" },
  { top: "85%", left: "0%", width: "280px" },
];

// Predefined circle positions
const CIRCLES = [
  { top: "15%", left: "70%", size: "150px" },
  { top: "40%", left: "10%", size: "120px" },
  { top: "65%", left: "80%", size: "180px" },
  { top: "80%", left: "25%", size: "140px" },
  { top: "30%", left: "50%", size: "160px" },
];

export function TrackTicketCTA() {
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { enableTracking, loading: featureLoading } = useFeatureToggle();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render if feature is disabled or still loading feature toggle
  if (featureLoading || !isClient || !enableTracking) {
    return null;
  }

  if (!mounted) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="h-10 mb-6"></div>
          <div className="h-16 mb-6"></div>
          <div className="h-6 mb-10"></div>
          <div className="h-16"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient background with more transparency */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60" />
        
        {/* Animated particles */}
        {PARTICLES.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, i % 2 === 0 ? -30 : 30, 0],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              scale: [1, i % 3 === 0 ? 1.5 : 0.6, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Animated beams */}
        {BEAMS.map((beam, i) => (
          <motion.div
            key={i}
            className="absolute top-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            style={{
              top: beam.top,
              left: beam.left,
              width: beam.width,
              transformOrigin: 'left',
            }}
            animate={{
              x: [0, typeof window !== 'undefined' ? window.innerWidth : 1000],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
        
        {/* Large floating circles */}
        {CIRCLES.map((circle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-white/40"
            style={{
              top: circle.top,
              left: circle.left,
              width: circle.size,
              height: circle.size,
            }}
            animate={{
              scale: [1, i % 2 === 0 ? 1.8 : 1.4, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center gap-3 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
            <Zap className="h-5 w-5 text-white" />
            <span className="text-base font-semibold text-white">Real-time Tracking</span>
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-4xl md:text-5xl font-extrabold mb-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Check Your Repair Status
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xl mb-12 opacity-95 max-w-2xl mx-auto text-white font-medium">
            Enter your ticket number to see real-time updates on your repair with our advanced tracking system
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Link href="/track">
              <Button size="lg" className="group bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <FileSearch className="mr-2 h-5 w-5" />
                Track Now
                <motion.span 
                  className="ml-2 inline-block"
                  animate={{ 
                    x: [0, 5],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}