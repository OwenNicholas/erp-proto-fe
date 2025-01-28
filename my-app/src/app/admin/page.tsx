// src/app/page.tsx
import React from "react";
import AdminPage from "./admin-page";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <AdminPage />
    </main>
  );
}
