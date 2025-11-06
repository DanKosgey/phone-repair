"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X, Home, ShoppingCart, Smartphone, Recycle, FileSearch } from "lucide-react";
import { useFeatureToggle } from "@/hooks/use-feature-toggle";
import { useEffect } from "react";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { enableShop, enableSecondHandProducts, enableTracking, loading } = useFeatureToggle();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until we know the feature toggle status
  if (loading || !isClient) {
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
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/20 rounded animate-pulse" />
                <div className="h-6 w-24 bg-primary/20 rounded animate-pulse" />
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="h-10 bg-primary/20 rounded animate-pulse" />
                <div className="h-10 bg-primary/20 rounded animate-pulse" />
                <div className="h-10 bg-primary/20 rounded animate-pulse" />
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop Products", href: "/products", icon: ShoppingCart },
    { name: "Device Marketplace", href: "/marketplace", icon: Recycle },
    { name: "Track Repair", href: "/track", icon: FileSearch },
  ] as { name: string; href: string; icon: any }[];

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
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { MobileMenu };