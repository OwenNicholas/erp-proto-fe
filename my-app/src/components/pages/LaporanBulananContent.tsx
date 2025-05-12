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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan Bulanan</h1>
      </div>

      {/* Report Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold">Ringkasan Penjualan Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(groupedSales).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-medium">Tidak ada data penjualan yang tersedia.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Bulan</TableHead>
                    <TableHead className="font-semibold text-right">Total Penjualan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedSales)
                    .sort((a, b) => {
                      const dateA = new Date(a[0]);
                      const dateB = new Date(b[0]);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map(([month, total]) => (
                      <TableRow key={month} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell className="text-right font-medium">
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
  );
}