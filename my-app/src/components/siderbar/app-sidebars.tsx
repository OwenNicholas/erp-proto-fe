"use client";
import { AiFillDollarCircle, AiOutlineHistory, AiOutlineTruck} from "react-icons/ai";
import { FaStore, FaBookOpen } from "react-icons/fa";
import * as React from "react";
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
    name: "user",
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
        { title: "Penjualan Gudang", url: "#" },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: AiOutlineHistory,
      items: [
        { title: "Telusuri Item lewat ID", url: "#" },
        { title: "History Transaksi", url: "#" },
      ],
    },
    {
      title: "Pindahan Inventory",
      url: "#",
      icon: AiOutlineTruck,
      items: [
        { title: "Pindahan", url: "#" },
        { title: "Retur Barang", url: "#" },
        { title: "Terima Barang", url: "#" },
      ],
    },
    {
    title: "Laporan",
    url: "#",
    icon: FaBookOpen,
    items: [
      { title: "Penjualan Harian", url: "#" },
      { title: "Penjualan Bulanan", url: "#" },
      { title: "Pindahan Harian", url: "#" },
      { title: "Pindahan Bulanan", url: "#" },
    ],
    },
  ],
};

export function AppSidebar({ onSubmenuChange }: { onSubmenuChange: (section: string) => void }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className="flex flex-col items-center py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-all"
        onClick={() => onSubmenuChange("Dashboard")} // Set Dashboard as active section
      >
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