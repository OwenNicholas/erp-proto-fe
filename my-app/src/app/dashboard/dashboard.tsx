"use client";
import { JSX, useState } from "react";
import { AppSidebar } from "@/components/siderbar/app-sidebars";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import DashboardContent from "@/components/pages/DashboardContent";
import PenjualanContent from "@/components/pages/PenjualanContent";
import PindahanContent from "@/components/pages/Pindahan";
import TelusuriItemContent from "@/components/pages/TelusuriItemContent";
import HistoryPindahanContent from "@/components/pages/HistoryPindahan";
import TransactionContent from "@/components/pages/TransactionContent";
import TerimaBarangContent from "@/components/pages/TerimaBarangContent";
import ReturBarangContent from "@/components/pages/ReturBarangContent";
import LaporanHarianContent from "@/components/pages/LaporanHarianContent";
import LaporanBulananContent from "@/components/pages/LaporanBulananContent";
import HistoryPindahanHarianContent from "@/components/pages/HistoryPindahanHarianContent";


// Map sections to components
const sectionComponents: Record<string, JSX.Element> = {
  Dashboard: <DashboardContent />,
  "Penjualan Toko": <PenjualanContent location="toko" />,
  "Penjualan TikTok": <PenjualanContent location="tiktok" />,
  "Penjualan Gudang": <PenjualanContent location="gudang" />,
  "Telusuri Item lewat ID": <TelusuriItemContent />, 
  "History Transaksi": <TransactionContent />, 
  "Pindahan": <PindahanContent />, 
  "Retur Barang": <ReturBarangContent />, 
  "Terima Barang": <TerimaBarangContent />,
  "Penjualan Harian": <LaporanHarianContent />,
  "Penjualan Bulanan": <LaporanBulananContent />,
  "Pindahan Harian": <HistoryPindahanHarianContent/>,
  "Pindahan Bulanan": <HistoryPindahanContent />,
};

export type SectionKey = keyof typeof sectionComponents & string

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("Dashboard");

  return (
      <SidebarProvider>
        <AppSidebar onSubmenuChange={(section) => setActiveSection(section as SectionKey)} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">Dashboard</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeSection}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {sectionComponents[activeSection] || (
              <div className="p-4 text-lg font-semibold text-gray-500">
                No Content Available
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}

