"use client";

import { Button } from "@/components/ui/button";
import { Smartphone, Wrench, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Predefined positions to avoid hydration issues
const FLOATING_ELEMENTS = [
  { top: "20%", left: "10%", size: "40px" },
  { top: "60%", left: "80%", size: "30px" },
  { top: "30%", left: "70%", size: "50px" },
  { top: "70%", left: "20%", size: "35px" },
  { top: "40%", left: "50%", size: "25px" },
  { top: "80%", left: "60%", size: "45px" },
];

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 mb-6"></div>
            <div className="h-20 mb-6"></div>
            <div className="h-6 mb-8"></div>
            <div className="h-16 mb-12"></div>
            <div className="h-12"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient blobs */}
        <motion.div 
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl"
          animate={{
            x: [0, 150, 0],
            y: [0, -150, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/10 to-primary/20 blur-3xl"
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Medium gradient blobs */}
        <motion.div 
          className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/15 to-primary/5 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Small animated elements */}
        {FLOATING_ELEMENTS.map((element, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              top: element.top,
              left: element.left,
              width: element.size,
              height: element.size,
            }}
            animate={{
              y: [0, i % 2 === 0 ? -30 : 30, 0],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
              scale: [1, i % 3 === 0 ? 1.3 : 0.8, 1],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2
            }}
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Repair Services</span>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 0.4
            }}
          >
            Professional Phone <span className="text-primary">Repair</span> Services
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 0.6
            }}
          >
            Fast, reliable repairs for all your devices. Track your repair status in real-time with our advanced system.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 0.8
            }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/track">
                <Button size="lg" className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Track Your Repair
                  <motion.span 
                    className="ml-2 inline-block"
                    animate={{ 
                      x: [0, 5, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 text-lg px-8 py-6">
                  Shop Products
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Feature highlights */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 1.0
            }}
          >
            {[
              { icon: Zap, text: "24h Express Service" },
              { icon: Wrench, text: "Expert Technicians" },
              { icon: Smartphone, text: "All Major Brands" }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  delay: 1.2 + index * 0.1
                }}
                whileHover={{ y: -5 }}
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced floating elements with more complex animations */}
      <motion.div 
        className="absolute top-1/4 left-10 hidden lg:block"
        animate={{ 
          y: [0, -40, 0],
          rotate: [0, 15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center shadow-xl border border-primary/10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Smartphone className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-1/4 right-10 hidden lg:block"
        animate={{ 
          y: [0, 40, 0],
          rotate: [0, -15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center shadow-xl border border-primary/10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Wrench className="h-12 w-12 text-primary" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}