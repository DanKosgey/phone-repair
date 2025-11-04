"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X, Home, ShoppingCart, Smartphone, Recycle, FileSearch } from "lucide-react";

const menuItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shop Products", href: "/products", icon: ShoppingCart },
  { name: "Device Marketplace", href: "/marketplace", icon: Recycle },
  { name: "Track Repair", href: "/track", icon: FileSearch },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation menu for mobile devices</SheetDescription>
        <div className="flex flex-col h-full">
          <div className="border-b p-4">
            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Jay's Shop</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}