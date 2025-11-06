"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Star, ShoppingCart, Zap, Award } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { Database } from "../../../types/database.types"
import { motion } from "framer-motion"

type Product = Database['public']['Tables']['products']['Row']

export function FeaturedProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image_url
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Determine if product is featured based on name or other criteria
  const isFeatured = product.name?.toLowerCase().includes('pro') || (product.price || 0) > 5000;
  const isHotDeal = (product.price || 0) > 80000;
  const isBestSeller = (product.price || 0) > 50000;

  return (
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-background to-primary/5 relative flex flex-col">
      {/* Animated border for featured products */}
      {isFeatured && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/40 via-purple-500/40 to-primary/40 blur-md -z-10"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      <CardHeader className="pb-4 relative">
        {/* Floating animation for the image container with more bounce */}
        <motion.div 
          className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden relative"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {product.image_url && product.image_url.startsWith('http') ? (
            <Image 
              src={product.image_url} 
              alt={product.name} 
              width={300}
              height={300}
              className="h-full w-full object-cover"
              quality={75}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="bg-primary/10 rounded-full p-4">
              <Smartphone className="h-16 w-16 text-primary" />
            </div>
          )}
          
          {/* Animated shine effect on image with more intensity */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Featured badge for special products with animation */}
        {isFeatured && (
          <motion.div
            className="absolute top-2 right-2 bg-gradient-to-r from-primary to-purple-500 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Star className="h-3 w-3 fill-current" />
            <span>Featured</span>
          </motion.div>
        )}
        
        {/* Hot deal badge with pulse animation */}
        {isHotDeal && (
          <motion.div
            className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Zap className="h-3 w-3" />
            <span>HOT</span>
          </motion.div>
        )}
        
        {/* Best seller badge */}
        {isBestSeller && (
          <motion.div
            className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Award className="h-3 w-3" />
            <span>Best Seller</span>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-2 mt-1">{product.description}</CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent className="mt-auto">
        <div className="flex justify-between items-center">
          <motion.span 
            className="text-2xl font-bold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            KSh {product.price?.toLocaleString()}
          </motion.span>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              size="sm" 
              onClick={handleAddToCart} 
              className="group bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 relative overflow-hidden"
            >
              {/* Animated background sweep */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10 flex items-center gap-1">
                Add to Cart
                <motion.span 
                  className="inline-block"
                  animate={{ 
                    x: [0, 5],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </motion.span>
              </span>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}