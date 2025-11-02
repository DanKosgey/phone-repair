"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ShoppingCart, Recycle, FileSearch, Wrench, Shield, Clock, Star } from "lucide-react";

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
  { name: "90-Day Warranty", icon: Shield, description: "All repairs backed by guarantee" },
  { name: "Expert Technicians", icon: Star, description: "Certified professionals" },
];

export function HomePageSidebar() {
  return (
    <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Navigate to key sections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Our Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="flex items-start gap-3">
              <service.icon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Why Choose Us */}
      <Card>
        <CardHeader>
          <CardTitle>Why Choose Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {whyChooseUs.map((item) => (
            <div key={item.name} className="flex items-start gap-3">
              <item.icon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}