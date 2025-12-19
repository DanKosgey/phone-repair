"use client"

import { Smartphone, Facebook, Twitter, Instagram, Mail, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBusinessConfig, type BusinessConfig } from '@/lib/config-service';
import { useContactInfo } from '@/hooks/use-contact-info';
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const contactInfo = useContactInfo();

  useEffect(() => {
    console.log('Footer: Auth state updated:', { user, isLoading });
    
    // Load business configuration
    const loadConfig = async () => {
      try {
        const config = await getBusinessConfig();
        setBusinessConfig(config);
      } catch (error) {
        console.error('Footer: Error loading business config:', error);
      }
    };
    
    loadConfig();
  }, [user, isLoading]);

  const handleAdminAccess = () => {
    console.log('Footer: Admin access button clicked', { user, isLoading });
    
    // Show loading state while checking auth
    if (isLoading) {
      return;
    }
    
    if (user) {
      console.log('Footer: Redirecting to admin dashboard');
      router.push('/admin');
    } else {
      console.log('Footer: Redirecting to login');
      router.push('/login');
    }
  };

  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-primary/10">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {businessConfig?.businessName || "Jay's Shop"}
              </span>
            </div>
            <p className="text-muted-foreground mb-6 font-medium">
              {businessConfig?.businessDescription || "Professional phone repair services and quality products."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 relative inline-block">
              Services
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/track" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  Track Repair
                </Link>
              </li>
              <li>
                <Link href="/products" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 relative inline-block">
              Company
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  Contact
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleAdminAccess}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-left text-muted-foreground hover:text-primary transition-colors group w-full bg-transparent border-none cursor-pointer disabled:opacity-50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                  {isLoading ? 'Loading...' : (user ? 'Admin Dashboard' : 'Admin Login')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 relative inline-block">
              Contact
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-muted-foreground font-medium">{contactInfo.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-muted-foreground font-medium">{contactInfo.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-muted-foreground font-medium">{contactInfo.hours}</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleAdminAccess}
              disabled={isLoading}
              className="mt-6 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-6 rounded-xl transition-all duration-300"
            >
              {isLoading ? 'Loading...' : (user ? 'Go to Dashboard' : 'Admin Access')}
            </Button>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 text-center">
          <p className="text-muted-foreground font-medium">
            &copy; {businessConfig?.copyrightText || "2024 Jay's Shop. All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
};