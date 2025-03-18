import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale"; // Indonesian locale formatting

// Define Transaction type
interface Transaction {
  transaction_id: number;
  timestamp: string;
}

// Define Sale type
interface Sale {
  sale_id: number;
  total: number;
  transaction_id: number;
}

export default function LaporanBulananContent() {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedSales, setGroupedSales] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSales();
    fetchTransactions();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/sales");
      if (!response.ok) throw new Error("Failed to fetch sales");
      const data = await response.json();
      setSalesData(data.data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // ✅ Fix: Use useCallback to prevent unnecessary re-creations
  const groupSalesByMonth = useCallback(() => {
    const grouped: Record<string, number> = {};

    salesData.forEach((sale) => {
      const transaction = transactions.find((tx) => tx.transaction_id === sale.transaction_id);
      if (!transaction || !transaction.timestamp) return;

      const saleDate = parseISO(transaction.timestamp);
      const monthYear = format(saleDate, "MMMM yyyy", { locale: id });

      if (!grouped[monthYear]) {
        grouped[monthYear] = 0;
      }
      grouped[monthYear] += sale.total;
    });

    setGroupedSales(grouped);
  }, [salesData, transactions]); // ✅ Dependencies added properly

  // ✅ Fix: Include groupSalesByMonth in dependencies
  useEffect(() => {
    if (salesData.length > 0 && transactions.length > 0) {
      groupSalesByMonth();
    }
  }, [salesData, transactions, groupSalesByMonth]); // ✅ Now includes the correct dependencies

  return (
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
    <div className="w-full max-w-5xl">
      <Card className="shadow-lg rounded-2xl border border-gray-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Laporan Penjualan Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(groupedSales).length === 0 ? (
            <p className="text-center text-gray-500 text-2xl font-semibold py-8">
              ❌ No sales data available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="w-full text-lg">
                <TableHeader>
                  <TableRow className="bg-gray-100 text-xl">
                    <TableHead className="px-6 py-4">Bulan</TableHead>
                    <TableHead className="px-6 py-4 text-right">💰 Total Penjualan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedSales).map(([month, total]) => (
                    <TableRow key={month} className="border-b text-xl">
                      <TableCell className="px-6 py-4">{month}</TableCell>
                      <TableCell className="px-6 py-4 text-right font-semibold">
                        Rp. {total.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  );
}