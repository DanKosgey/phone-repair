"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
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

  return (
    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-4">
        <motion.div 
          className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {product.image_url && product.image_url.startsWith('http') ? (
            <Image 
              src={product.image_url} 
              alt={product.name} 
              width={300}
              height={300}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="bg-primary/10 rounded-full p-4">
              <Smartphone className="h-16 w-16 text-primary" />
            </div>
          )}
        </motion.div>
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <motion.span 
            className="text-2xl font-bold text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
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
              className="group bg-primary hover:bg-primary/90"
            >
              Add to Cart
              <motion.span 
                className="ml-1 inline-block"
                animate={{ 
                  x: [0, 3, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                +
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}