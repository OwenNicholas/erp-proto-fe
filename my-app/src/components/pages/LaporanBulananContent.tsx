import React, { useEffect, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale"; // Indonesian locale formatting

// Define Transaction type based on API response
interface Transaction {
  transaction_id: number;
  discount_type: string;
  discount_percent: number;
  total_discount: number;
  total_price: number;
  payment_id: number;
  customer_name: string;
  timestamp: string;
  location: string;
  payment_status: string;
  down_payment: number;
}

export default function LaporanBulananContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedSales, setGroupedSales] = useState<Record<string, { total: number; discount: number }>>({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://103.185.52.233:8080/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const groupSalesByMonth = useCallback(() => {
    const grouped: Record<string, { total: number; discount: number }> = {};

    transactions.forEach((transaction) => {
      if (!transaction.timestamp) return;

      const saleDate = parseISO(transaction.timestamp);
      const monthYear = format(saleDate, "MMMM yyyy", { locale: id });

      if (!grouped[monthYear]) {
        grouped[monthYear] = { total: 0, discount: 0};
      }
      
      grouped[monthYear].total += transaction.total_price;
      grouped[monthYear].discount += transaction.total_discount;
    });

    setGroupedSales(grouped);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      groupSalesByMonth();
    }
  }, [transactions, groupSalesByMonth]);

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
                    <TableHead className="font-semibold text-right">Total Diskon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedSales)
                    .sort((a, b) => {
                      const dateA = new Date(a[0]);
                      const dateB = new Date(b[0]);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map(([month, data]) => (
                      <TableRow key={month} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{month}</TableCell>
                        <TableCell className="text-right font-medium">
                          Rp. {data.total.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          Rp. {data.discount.toLocaleString("id-ID")}
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