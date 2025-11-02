'use client';

import { Button, ButtonProps } from "@/components/ui/button";
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { LogOut } from "lucide-react";

interface LogoutButtonProps extends ButtonProps {
  redirectPath?: string;
}

export function LogoutButton({ 
  redirectPath = '/login', 
  children,
  ...props 
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push(redirectPath);
  };

  return (
    <Button onClick={handleLogout} {...props}>
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  );
}