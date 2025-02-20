"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define expected API response types
interface InventoryItem {
  item_id: string;
  quantity: number;
  description: string;
  price: number;
}

interface InventoryResponse {
  meta: {
    code: number;
    status: string;
  };
  data: InventoryItem[];
}

const DashboardContent = () => {
  const [tokoData, setTokoData] = useState<InventoryItem[]>([]);
  const [gudangData, setGudangData] = useState<InventoryItem[]>([]);
  const [tiktokData, setTiktokData] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokoRes, gudangRes, tiktokRes] = await Promise.all([
          fetch("http://localhost:8080/api/inventory/toko"),
          fetch("http://localhost:8080/api/inventory/gudang"),
          fetch("http://localhost:8080/api/inventory/tiktok"),
        ]);

        const tokoJson: InventoryResponse = await tokoRes.json();
        const gudangJson: InventoryResponse = await gudangRes.json();
        const tiktokJson: InventoryResponse = await tiktokRes.json();

        setTokoData(tokoJson.data || []);
        setGudangData(gudangJson.data || []);
        setTiktokData(tiktokJson.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatChartData = (data: InventoryItem[]) =>
    data
      .sort((a, b) => a.item_id.localeCompare(b.item_id)) // Sort alphabetically
      .map((item) => ({
        name: item.item_id, // Item ID for Y-axis
        quantity: item.quantity, // Quantity for X-axis
      }));

  const chartConfig: ChartConfig = {
    quantity: {
      label: "Stock Quantity",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="p-4 text-lg font-semibold">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Toko Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Toko</CardTitle>
            <CardDescription>Stock availability in Toko</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={formatChartData(tokoData)}
                  layout="vertical"
                  margin={{ left: 50 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    width={100} // Increase width for better visibility
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" fill="var(--color-desktop)" radius={5} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Updated stock levels <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing current stock availability
            </div>
          </CardFooter>
        </Card>

        {/* Gudang Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Gudang</CardTitle>
            <CardDescription>Stock levels in Gudang</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={formatChartData(gudangData)}
                  layout="vertical"
                  margin={{ left: 50 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" fill="var(--color-desktop)" radius={5} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Updated stock levels <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing current stock availability
            </div>
          </CardFooter>
        </Card>

        {/* TikTok Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory TikTok</CardTitle>
            <CardDescription>Stock levels in TikTok inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={formatChartData(tiktokData)}
                  layout="vertical"
                  margin={{ left: 50 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" fill="var(--color-desktop)" radius={5} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Updated stock levels <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing current stock availability
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;