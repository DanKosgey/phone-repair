"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { CartSheet } from "@/components/cart/CartSheet"
import { MobileMenu } from "@/components/layout/MobileMenu"
import { motion } from "framer-motion"

export const Navbar = () => {
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
              <span className="text-xl font-bold">RepairHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { name: "Home", href: "/" },
              { name: "Products", href: "/products" },
              { name: "Marketplace", href: "/marketplace" },
              { name: "Track Repair", href: "/track" }
            ].map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link 
                  href={link.href} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <CartSheet />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}