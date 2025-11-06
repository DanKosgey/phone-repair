"use client"

import { Smartphone, Facebook, Twitter, Instagram } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBusinessConfig, type BusinessConfig } from '@/lib/config-service';
import { useContactInfo } from '@/hooks/use-contact-info';

export const Footer = () => {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const contactInfo = useContactInfo();

  useEffect(() => {
    console.log('Footer: Auth state updated:', { user, role, isLoading });
    
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
  }, [user, role, isLoading]);

  const handleAdminAccess = () => {
    console.log('Footer: Admin access button clicked', { user, role, isLoading });
    
    // Show loading state while checking auth
    if (isLoading) {
      return;
    }
    
    if (user && role === 'admin') {
      console.log('Footer: Redirecting to admin dashboard');
      router.push('/admin');
    } else {
      console.log('Footer: Redirecting to login');
      router.push('/login');
    }
  };

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{businessConfig?.businessName || "Jay's Shop"}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {businessConfig?.businessDescription || "Professional phone repair services and quality products."}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/track" className="hover:text-primary">Track Repair</Link></li>
              <li><Link href="/products" className="hover:text-primary">Shop Products</Link></li>
              <li><Link href="/marketplace" className="hover:text-primary">Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li>
                <button 
                  onClick={handleAdminAccess}
                  disabled={isLoading}
                  className="text-left hover:text-primary w-full text-sm bg-transparent border-none cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : (user && role === 'admin' ? 'Admin Dashboard' : 'Admin Login')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Phone: {contactInfo.phone}</li>
              <li>Email: {contactInfo.email}</li>
              <li>Hours: {contactInfo.hours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p>&copy; {businessConfig?.copyrightText || "2024 Jay's Shop. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  );
};