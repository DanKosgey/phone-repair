"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone } from "lucide-react"
import { CartSheet } from "@/components/cart/CartSheet"
import { MobileMenu } from "@/components/layout/MobileMenu"

export const Navbar = () => {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MobileMenu />
            <Link href="/" className="flex items-center space-x-2">
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RepairHub</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/marketplace" className="text-sm font-medium hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/track" className="text-sm font-medium hover:text-primary transition-colors">
              Track Repair
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <CartSheet />
          </div>
        </div>
      </div>
    </nav>
  )
}