"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { CartSheet } from "@/components/cart/CartSheet"
import { MobileMenu } from "@/components/layout/MobileMenu"
import { motion } from "framer-motion"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { useEffect, useState } from "react"

export const Navbar = () => {
  const { enableShop, enableSecondHandProducts, enableTracking, loading } = useFeatureToggle();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until we know the feature toggle status
  if (loading || !isClient) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded animate-pulse" />
              <div className="h-6 w-24 bg-primary/20 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="h-4 w-12 bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-12 bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-12 bg-primary/20 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <motion.nav 
      className="border-b bg-card"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Smartphone className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-xl font-bold">Jay's Shop</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { name: "Home", href: "/" },
              { name: "Shop Products", href: "/products" },
              { name: "Marketplace", href: "/marketplace" },
              { name: "Track Repair", href: "/track" },
            ].map((item: any) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <CartSheet />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}