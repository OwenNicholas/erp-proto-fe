"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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

    const url = "http://localhost:8080/api/verify-user";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json(); // ✅ Parse response body as JSON
        const { role } = data; // ✅ Now you can extract role

        setMessage("Login successful!");
        //localStorage.setItem("username", username);
        //localStorage.setItem("role", role); // Store the role in localStorage if needed for later
        // Route based on role
        if (role === "admin") {
        router.push("/admin"); // Navigate to admin page
        } else if (role === "user") {
        router.push("/dashboard"); // Navigate to dashboard
        } else {
        setError("Unknown role. Please contact support.");
        }
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          setError("Invalid input. Please check your details.");
        } else if (error.response.status === 401) {
          setError("Invalid username or password");
        } else if (error.response.status === 404) {
          setError("User not found");
        } else {
          setError(`Error: ${error.response.data.error || "Unknown error"}`);
        }
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };




  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {"Login"}
          </CardTitle>
          <CardDescription>
            {"Masukan username dan password anda untuk login"}
          </CardDescription>
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
                {"Login"}
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