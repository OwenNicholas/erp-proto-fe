"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ className, ...props }: { className?: string }) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const url = "http://103.185.52.233:8080/api/verify-user";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const result = await response.json(); 
        
        const role = result.data?.role;  
      
        setMessage("Login successful!");
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);
      
        // Route based on role
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "user") {
          router.push("/dashboard");
        } else {
          setError(`Unknown role: "${role}". Please contact support.`);
        }
      }
      else {
        setError("Unexpected response from the server.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`An error occurred: ${error.message}`);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Masukan username dan password anda untuk login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
          {message && <p className="text-green-500 mt-4">{message}</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;