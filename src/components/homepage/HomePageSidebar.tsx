"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ShoppingCart, Recycle, FileSearch, Wrench, Shield, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";

const quickLinks = [
  { name: "Products", href: "/products", icon: ShoppingCart },
  { name: "Marketplace", href: "/marketplace", icon: Recycle },
  { name: "Track Repair", href: "/track", icon: FileSearch },
];

const services = [
  { name: "Repair Services", icon: Wrench, description: "Expert repairs with warranty" },
  { name: "Quality Products", icon: ShoppingCart, description: "Genuine parts and accessories" },
  { name: "Trade-In Program", icon: Recycle, description: "Buy and sell second-hand devices" },
];

const whyChooseUs = [
  { name: "Fast Turnaround", icon: Clock, description: "Most repairs within 24-48 hours" },
  { name: "Expert Technicians", icon: Star, description: "Certified professionals" },
  { name: "Quality Guarantee", icon: Shield, description: "All repairs backed by guarantee" },
];

export function HomePageSidebar() {
  return (
    <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to key sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <Link href={link.href}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.name}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Services */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Our Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-start gap-3"
              >
                <service.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Why Choose Us */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Why Choose Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-start gap-3"
              >
                <item.icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}