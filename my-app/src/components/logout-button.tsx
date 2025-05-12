"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    
    // Remove cookies
    document.cookie = "username=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Logout
    </Button>
  );
} 