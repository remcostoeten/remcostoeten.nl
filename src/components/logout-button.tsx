"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-client";

type TProps = {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function LogoutButton({ 
  variant = "outline", 
  size = "default", 
  showIcon = true, 
  children = "Sign Out",
  className
}: TProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout } = useAuth();

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {showIcon && <LogOut />}
      {isLoggingOut ? "Signing Out..." : children}
    </Button>
  );
}
