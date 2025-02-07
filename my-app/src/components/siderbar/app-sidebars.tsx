"use client";
import { AiFillDollarCircle, AiOutlineHistory, AiOutlineTruck, AiFillBook } from "react-icons/ai";
import { FaStore } from "react-icons/fa";
import * as React from "react";
import { SectionKey } from "@/app/dashboard/dashboard"; 
import {
  GalleryVerticalEnd,
} from "lucide-react";

import { NavMain } from "@/components/siderbar/nav-mains";
import { NavUser } from "@/components/siderbar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Sidebar menu items
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Penjualan",
      url: "#",
      icon: AiFillDollarCircle,
      isActive: false,
      items: [
        { title: "Penjualan Toko", url: "#" },
        { title: "Penjualan TikTok", url: "#" },
      ],
    },
    {
      title: "History Penjualan",
      url: "#",
      icon: AiOutlineHistory,
      items: [
        { title: "Telusuri Item lewat ID", url: "#" },
        { title: "Lihat Full History", url: "#" },
      ],
    },
    {
      title: "Pindahan Inventory",
      url: "#",
      icon: AiOutlineTruck,
      items: [
        { title: "Pindahan", url: "#" },
        { title: "Retur Barang", url: "#" },
      ],
    },
    {
      title: "Laporan",
      url: "#",
      icon: AiFillBook,
      items: [
        { title: "Laporan Harian", url: "#" },
      ],
    },
  ],
};

export function AppSidebar({ onSubmenuChange }: { onSubmenuChange: (section: string) => void }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col items-center py-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <FaStore className="text-2xl text-gray-900" />
        <h2 className="text-xl font-semibold text-gray-900 tracking-wide">
          TOKO OLIVIA
        </h2>
      </div>
      <h3 className="text-sm font-medium text-gray-600">
        Inventory Management
      </h3>
    </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onSubmenuChange={onSubmenuChange} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}