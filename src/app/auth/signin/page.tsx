"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TRegistrationStatus = {
  enabled: boolean;
  message: string;
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<TRegistrationStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkRegistrationStatus() {
      try {
        const response = await fetch('/api/auth/registration-status');
        const status = await response.json();
        setRegistrationStatus(status);
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
    }
    
    checkRegistrationStatus();
  }, []);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/admin/cms");
      } else {
        setError(result.error || "Failed to sign in");
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in to CMS</CardTitle>
          <CardDescription>
            Enter your credentials to access the content management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          {registrationStatus?.enabled && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Access restricted to authorized users only
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
