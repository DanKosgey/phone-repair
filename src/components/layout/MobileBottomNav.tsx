"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Recycle, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: ShoppingCart },
  { name: "Marketplace", href: "/marketplace", icon: Recycle },
  { name: "Track", href: "/track", icon: FileSearch },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: isActive ? 0 : -5 }}
              >
                <item.icon
                  className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")}
                />
                <span className="mt-1">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}