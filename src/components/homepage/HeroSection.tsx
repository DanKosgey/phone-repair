"use client";

import { Button } from "@/components/ui/button";
import { Smartphone, Wrench, Zap, ShoppingCart, Package } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getBusinessConfig } from '@/lib/config-service';
import { useFeatureToggle } from '@/hooks/use-feature-toggle';

// Optimized floating elements configuration - reduced number
const FLOATING_ELEMENTS = [
  { top: "15%", left: "8%", size: 45, delay: 0 },
  { top: "65%", left: "85%", size: 35, delay: 2 },
  { top: "25%", left: "75%", size: 55, delay: 4 },
  { top: "75%", left: "15%", size: 40, delay: 1 },
  { top: "45%", left: "55%", size: 30, delay: 3 },
];

// Feature icons configuration
const FEATURES = [
  { icon: Zap, text: "24h Express Service" },
  { icon: Wrench, text: "Expert Technicians" },
  { icon: Smartphone, text: "All Major Brands" },
];

// Animation variants for better organization
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [showNonCriticalAnimations, setShowNonCriticalAnimations] = useState(false);
  const isMobile = useIsMobile();
  const [businessConfig, setBusinessConfig] = useState<any>(null);
  const { enableShop, enableSecondHandProducts, enableTracking, loading: featureLoading } = useFeatureToggle();

  useEffect(() => {
    setMounted(true);
    
    // Load business configuration
    const loadConfig = async () => {
      try {
        const config = await getBusinessConfig();
        setBusinessConfig(config);
      } catch (error) {
        console.error('HeroSection: Error loading business config:', error);
        // Use default values if config fails to load
        setBusinessConfig({
          businessName: "Jay's Shop",
          businessDescription: "Professional phone repair services and quality products."
        });
      }
    };
    
    loadConfig();
    
    // Delay non-critical animations to improve initial load performance
    const timer = setTimeout(() => {
      setShowNonCriticalAnimations(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Skeleton loader for SSR
  if (!mounted || featureLoading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-10 w-64 mx-auto bg-primary/10 rounded-full animate-pulse" />
            <div className="h-20 bg-primary/10 rounded-lg animate-pulse" />
            <div className="h-6 bg-primary/10 rounded animate-pulse" />
            <div className="flex gap-4 justify-center">
              <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
              <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Use default values if config hasn't loaded yet
  const config = businessConfig || {
    businessName: "Jay's Shop",
    businessDescription: "Professional phone repair services and quality products."
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
      {/* Enhanced animated background with better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs with optimized animation */}
        <motion.div
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl"
          animate={showNonCriticalAnimations ? {
            x: [0, 150, 0],
            y: [0, -150, 0],
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/10 to-primary/20 blur-3xl"
          animate={showNonCriticalAnimations ? {
            x: [0, -150, 0],
            y: [0, 150, 0],
            scale: [1, 1.4, 1],
          } : {}}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Medium accent blob */}
        <motion.div
          className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-primary/15 to-primary/5 blur-3xl"
          animate={showNonCriticalAnimations ? {
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Optimized floating elements - reduced count */}
        <AnimatePresence>
          {showNonCriticalAnimations && FLOATING_ELEMENTS.map((element, i) => (
            <motion.div
              key={`float-${i}`}
              className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
              style={{
                top: element.top,
                left: element.left,
                width: element.size,
                height: element.size,
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                y: [0, i % 2 === 0 ? -30 : 30, 0],
                x: [0, i % 2 === 0 ? 30 : -30, 0],
                scale: [1, i % 3 === 0 ? 1.3 : 0.8, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 15 + element.delay * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: element.delay,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Grid pattern overlay for depth - static for better performance */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb,0,0,0),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb,0,0,0),0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Professional Repair Services
              </span>
            </div>
          </motion.div>

          {/* Main heading with enhanced glow effect */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 relative"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="relative inline-block">
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
                Professional Phone{" "}
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 blur-2xl"
                animate={showNonCriticalAnimations ? {
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
            <span className="relative inline-block">
              <motion.span
                className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary"
                animate={showNonCriticalAnimations ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                } : {}}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Repair
              </motion.span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary/50 blur-xl"
                animate={showNonCriticalAnimations ? {
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
                {" "}
                Services
              </span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {config.businessDescription}
          </motion.p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <motion.div
                whileHover={isMobile ? {} : {
                  scale: 1.05,
                  boxShadow: "0 5px 15px -5px rgba(var(--primary-rgb, 0, 0, 0), 0.15), 0 0 10px rgba(var(--primary-rgb, 0, 0, 0), 0.1)",
                }}
                whileTap={isMobile ? {} : { scale: 0.95 }}
                className="relative"
              >
                {/* Outer glow ring - reduced intensity */}
                <motion.div
                  className="absolute inset-0 rounded-lg blur-sm bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10"
                  animate={showNonCriticalAnimations ? {
                    opacity: [0.15, 0.3, 0.15],
                    scale: [1, 1.01, 1],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border border-green-500/30 text-lg px-8 py-6 relative overflow-hidden group bg-background/80 backdrop-blur-sm theme-glow-animation"
                >
                  <span className="relative z-10 font-semibold flex items-center gap-2">
                    Device Marketplace
                    <motion.span
                      animate={{ 
                        x: [0, 5, 0],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      →
                    </motion.span>
                  </span>
                  {/* Animated gradient sweep - reduced intensity */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={showNonCriticalAnimations ? {
                      x: ["-200%", "200%"],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Pulsing background glow - reduced intensity */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/8 via-emerald-500/8 to-green-500/8"
                    animate={showNonCriticalAnimations ? {
                      opacity: [0.1, 0.2, 0.1],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>
            </Link>

            <Link href="/products">
              <motion.div
                whileHover={isMobile ? {} : {
                  scale: 1.05,
                  boxShadow: "0 5px 15px -5px rgba(var(--primary-rgb, 0, 0, 0), 0.15), 0 0 10px rgba(var(--primary-rgb, 0, 0, 0), 0.1)",
                }}
                whileTap={isMobile ? {} : { scale: 0.95 }}
                className="relative"
              >
                {/* Outer glow ring - reduced intensity */}
                <motion.div
                  className="absolute inset-0 rounded-lg blur-sm bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10"
                  animate={showNonCriticalAnimations ? {
                    opacity: [0.15, 0.3, 0.15],
                    scale: [1, 1.01, 1],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border border-primary/30 text-lg px-8 py-6 relative overflow-hidden group bg-background/80 backdrop-blur-sm theme-glow-animation"
                >
                  <span className="relative z-10 font-semibold flex items-center gap-2">
                    Shop Products
                    <motion.span
                      animate={{ 
                        x: [0, 5, 0],
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      →
                    </motion.span>
                  </span>
                  {/* Animated gradient sweep - reduced intensity */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={showNonCriticalAnimations ? {
                      x: ["-200%", "200%"],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* Pulsing background glow - reduced intensity */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/8 via-purple-500/8 to-primary/8"
                    animate={showNonCriticalAnimations ? {
                      opacity: [0.1, 0.2, 0.1],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>
            </Link>

            <Link href="/track">
              <motion.div
                whileHover={isMobile ? {} : {
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(var(--primary-rgb, 0, 0, 0), 0.3)",
                }}
                whileTap={isMobile ? {} : { scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 relative overflow-hidden group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl theme-glow-animation"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Track Your Repair
                    <motion.span
                      animate={showNonCriticalAnimations ? { x: [0, 5, 0] } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary/30"
                    animate={showNonCriticalAnimations ? {
                      x: ["-100%", "100%"],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </Button>
              </motion.div>
            </Link>
          </div>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-16"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {FEATURES.map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-primary/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={isMobile ? {} : {
                  y: -5,
                  boxShadow: "0 10px 20px -5px rgba(var(--primary-rgb, 0, 0, 0), 0.2)",
                }}
              >
                <motion.div
                  animate={showNonCriticalAnimations ? {
                    rotate: [0, 10, -10, 0],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5,
                  }}
                >
                  <item.icon className="h-5 w-5 text-primary" />
                </motion.div>
                <span className="font-medium text-sm">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced floating icon cards - only show on desktop for performance */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-1/4 left-10 md:left-20"
            animate={showNonCriticalAnimations ? {
              y: [0, -40, 0],
              rotate: [0, 15, 0],
            } : {}}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md flex items-center justify-center shadow-xl border border-primary/20 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"
                animate={showNonCriticalAnimations ? {
                  x: ["-100%", "100%"],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <Smartphone className="h-8 w-8 md:h-12 md:w-12 text-primary relative z-10" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-1/4 right-10 md:right-20"
            animate={showNonCriticalAnimations ? {
              y: [0, 40, 0],
              rotate: [0, -15, 0],
            } : {}}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md flex items-center justify-center shadow-xl border border-primary/20 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent"
                animate={showNonCriticalAnimations ? {
                  x: ["-100%", "100%"],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1,
                }}
              />
              <Wrench className="h-8 w-8 md:h-12 md:w-12 text-primary relative z-10" />
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
}