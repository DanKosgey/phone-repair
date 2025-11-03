"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X, Home, ShoppingCart, Smartphone, Recycle, FileSearch } from "lucide-react";

const menuItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: ShoppingCart },
  { name: "Marketplace", href: "/marketplace", icon: Recycle },
  { name: "Track Repair", href: "/track", icon: FileSearch },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        {/* Adding SheetTitle for accessibility */}
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Adding SheetDescription for accessibility */}
        <SheetDescription className="sr-only">
          Mobile navigation menu with links to main sections of the website
        </SheetDescription>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b py-4">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RepairHub</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex flex-col gap-2 py-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
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