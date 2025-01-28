// src/app/page.tsx
import React from "react";
import { LoginForm } from "./login";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <LoginForm />
    </main>
  );
}

