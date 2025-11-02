"use client"

import { Smartphone } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const Footer = () => {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Footer: Auth state updated:', { user, role, isLoading });
  }, [user, role, isLoading]);

  const handleAdminAccess = () => {
    console.log('Footer: Admin access button clicked', { user, role });
    if (user && role === 'admin') {
      console.log('Footer: Redirecting to admin dashboard');
      router.push('/admin');
    } else {
      console.log('Footer: Redirecting to login');
      router.push('/login');
    }
  };

  return (
    <footer className="border-t bg-card mt-auto pb-16 lg:pb-0">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-5 w-5 text-primary" />
              <span className="font-bold">RepairHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional phone repair services and quality products.
            </p>
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
                  className="text-left hover:text-primary w-full text-sm bg-transparent border-none cursor-pointer"
                >
                  {isLoading ? 'Loading...' : (user && role === 'admin' ? 'Admin Dashboard' : 'Admin Login')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Phone: (555) 123-4567</li>
              <li>Email: support@repairhub.com</li>
              <li>Hours: Mon-Sat 9AM-6PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 RepairHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};