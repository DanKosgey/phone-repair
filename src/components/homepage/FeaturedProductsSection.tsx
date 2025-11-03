"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { FeaturedProductCard } from "@/components/homepage/FeaturedProductCard";
import { Database } from "../../../types/database.types";

type Product = Database['public']['Tables']['products']['Row'];

export function FeaturedProductsSection({ featuredProducts }: { featuredProducts: Product[] }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-2">
              Check out our most popular items
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/products">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                View All
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
              className="h-full"
            >
              <FeaturedProductCard product={product} />
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