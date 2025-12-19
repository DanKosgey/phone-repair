"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Menu, X } from "lucide-react"
import { CartSheet } from "@/components/cart/CartSheet"
import { motion, AnimatePresence } from "framer-motion"
import { useFeatureToggle } from "@/hooks/use-feature-toggle"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export const Navbar = () => {
  const { enableShop, enableSecondHandProducts, enableTracking, loading } = useFeatureToggle();
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until we know the feature toggle status
  if (loading || !isClient) {
    return (
      <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
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

  const navItems = [
    { name: "Home", href: "/" },
    enableShop && { name: "Shop Products", href: "/products" },
    enableSecondHandProducts && { name: "Marketplace", href: "/marketplace" },
    enableTracking && { name: "Track Repair", href: "/track" },
  ].filter(Boolean) as { name: string; href: string }[];

  return (
    <motion.nav 
      className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Smartphone className="h-8 w-8 text-primary" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Jay's Shop
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  pathname === item.href 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <CartSheet />
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden border-t bg-card/95 backdrop-blur-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    pathname === item.href 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}