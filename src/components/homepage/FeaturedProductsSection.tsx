"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FeaturedProductCard } from "@/components/homepage/FeaturedProductCard";
import { Database } from "../../../types/database.types";
import { Star, Zap } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/use-featured-products";

type Product = Database['public']['Tables']['products']['Row'];

export function FeaturedProductsSection() {
  const { data: featuredProducts = [], isLoading, error } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
              <div>
                <div className="h-8 w-48 bg-primary/20 rounded animate-pulse" />
                <div className="h-4 w-64 bg-primary/10 rounded mt-2 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-48 bg-primary/20 rounded animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-80 bg-primary/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load featured products</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        {/* Additional floating elements for more liveliness */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className="absolute w-4 h-4 rounded-full bg-yellow-400"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Star className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <motion.h2 
                className="text-3xl font-bold relative inline-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Featured Products
                </span>
                {/* Animated underline */}
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                {/* Animated sparkle on the title */}
                <motion.div
                  className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.h2>
              <motion.p 
                className="text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Check out our most popular items
              </motion.p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/products">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View All Products
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
                {/* Animated background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -15,
                transition: { duration: 0.3 }
              }}
              className="h-full relative"
            >
              {/* Animated border glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 blur-md -z-10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.8 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Floating animation for each card with more bounce */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <FeaturedProductCard product={product} />
              </motion.div>
              
              {/* Sparkle effects */}
              <motion.div
                className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              
              {/* Additional sparkle effects for more liveliness */}
              <motion.div
                className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
              />
            </motion.div>
          ))}
          {featuredProducts.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No featured products available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}