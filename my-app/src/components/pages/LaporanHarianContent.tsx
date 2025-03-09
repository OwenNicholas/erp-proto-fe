"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Updated Payment Method Mapping
const paymentMethodsMap: Record<number, string> = {
  1: "Tunai",
  2: "Debit",
  3: "Transfer",
  4: "Cek / GIRO",
  5: "QR",
  6: "Hutang",
};

// Define the Transaction type
interface Transaction {
  transaction_id: number;
  discount_type: string;
  discount_percent: number;
  total_discount: number;
  payment_id: number;
  customer_name: string;
  timestamp: string; // Ensure timestamp is included as a string
  location: string;
  payment_status: string;
}

// Define the Sale type
interface Sale {
  sale_id: number;
  item_id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  discount_per_item: number;
  quantity_retur: number;
  transaction_id: number;
  location: string;
}

// Type for grouped sales
type SaleGroup = Record<string, { customer: string; amount: number }[]>;

export default function LaporanHarian() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [salesData, setSalesData] = useState<Sale[]>([]);

  useEffect(() => {
    fetchSales();
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactionsByDate();
  }, [selectedDate, transactions]);

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

  // Filter transactions based on the selected date
  const filterTransactionsByDate = useCallback(() => {
    const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");

    const filtered = transactions.filter((transaction) => {
      const transactionDate = format(parseISO(transaction.timestamp), "yyyy-MM-dd");
      return transactionDate === formattedSelectedDate;
    });

    setFilteredTransactions(filtered);
  }, [selectedDate, transactions]); // ✅ Proper dependencies

  useEffect(() => {
    filterTransactionsByDate();
  }, [filterTransactionsByDate]);

  // Group transactions by payment method
  const getSalesByPaymentMethod = (): SaleGroup => {
    const groupedSales: SaleGroup = {};

    filteredTransactions.forEach((transaction) => {
      const method = paymentMethodsMap[transaction.payment_id] || "Unknown";
      if (!groupedSales[method]) groupedSales[method] = [];

      // Find corresponding sales for this transaction
      const relatedSales = salesData.filter((sale) => sale.transaction_id === transaction.transaction_id);

      relatedSales.forEach((sale) => {
        groupedSales[method].push({
          customer: transaction.customer_name,
          amount: sale.total,
        });
      });
    });

    return groupedSales;
  };

  // Compute total per payment method
  const computeTotal = (sales: { customer: string; amount: number }[]): number => {
    return sales.reduce((sum, sale) => sum + sale.amount, 0);
  };

  const salesByPaymentMethod = getSalesByPaymentMethod();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Date Picker */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Laporan Penjualan Harian</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={(date) => date && setSelectedDate(date)} 
              className="w-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
  
      {/* 🔹 Show "No Sales" message if there are no transactions */}
      {Object.keys(salesByPaymentMethod).length === 0 ? (
        <div className="text-center text-gray-500 text-lg font-semibold mt-10">
          ❌ Tidak ada penjualan di tanggal ini.
        </div>
      ) : (
        Object.keys(salesByPaymentMethod).map((method) => (
          <Card key={method} className="mb-6">
            <CardHeader>
              <CardTitle>{method}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xl font-semibold">
                <span>Total:</span>
                <span>Rp. {computeTotal(salesByPaymentMethod[method]).toLocaleString("id-ID")}</span>
              </div>
  
              {/* Customer Breakdown Table */}
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Customer</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByPaymentMethod[method].map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.customer}</TableCell>
                      <TableCell className="text-right">Rp. {entry.amount.toLocaleString("id-ID")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}