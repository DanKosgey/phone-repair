"use client";

import { Clock, Star, Award, Zap, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Predefined positions to avoid hydration issues
const BACKGROUND_SHAPES = [
  { top: "10%", left: "5%", size: "80px", type: "circle" },
  { top: "25%", left: "80%", size: "60px", type: "square" },
  { top: "40%", left: "15%", size: "70px", type: "circle" },
  { top: "60%", left: "70%", size: "90px", type: "square" },
  { top: "75%", left: "25%", size: "50px", type: "circle" },
  { top: "85%", left: "85%", size: "65px", type: "square" },
  { top: "15%", left: "40%", size: "55px", type: "circle" },
  { top: "50%", left: "50%", size: "75px", type: "square" },
  { top: "70%", left: "10%", size: "60px", type: "circle" },
  { top: "30%", left: "90%", size: "80px", type: "square" },
];

const whyChooseUs = [
  { icon: Clock, title: "Fast Turnaround", description: "Most repairs completed within 24-48 hours" },
  { icon: Star, title: "Expert Technicians", description: "Certified professionals with years of experience" },
  { icon: Award, title: "Quality Certified", description: "Industry recognized repair standards" },
  { icon: Zap, title: "Express Service", description: "Priority handling for urgent repairs" },
  { icon: Headphones, title: "24/7 Support", description: "Round-the-clock customer assistance" }
];

export function WhyChooseUsSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="h-16 mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10" />
        
        {/* Animated geometric shapes */}
        {BACKGROUND_SHAPES.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            style={{
              top: shape.top,
              left: shape.left,
              width: shape.size,
              height: shape.size,
              borderWidth: shape.type === "circle" ? "2px" : "1px",
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, shape.type === "circle" ? 1.3 : 0.8, 1],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {shape.type === "square" ? (
              <div className="w-full h-full border border-primary rounded-lg" />
            ) : (
              <div className="w-full h-full border border-primary rounded-full" />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why Choose Us
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Trusted by thousands of satisfied customers worldwide
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChooseUs.map((item, index) => (
            <motion.div
              key={item.title}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 mx-auto border border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10"
                whileHover={{ 
                  rotate: [0, 10, 0],
                  scale: 1.1,
                }}
                transition={{ 
                  rotate: { duration: 0.5, ease: "easeInOut" },
                  scale: { duration: 0.3, type: "spring", stiffness: 300 }
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 group-hover:bg-primary/20">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
              </motion.div>
              <motion.h3 
                className="font-semibold text-xl mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
              >
                {item.title}
              </motion.h3>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {item.description}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}