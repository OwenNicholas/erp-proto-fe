"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { groupBy } from "lodash"; // For easy grouping

interface HistoryEntry {
  pindahan_id: number;
  item_id: string;
  quantity: number;
  timestamp: string;
  source: string;
  destination: string;
  price?: number;
}

export default function HistoryPindahanContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://103.185.52.233:3000/api/history");
      if (!response.ok) throw new Error("Failed to fetch history data");

      const data = await response.json();
      setHistory(data.data || []);
    } catch (err) {
      setError("Failed to load history data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Group data by Month-Year
  const groupedHistory = groupBy(history, (entry) =>
    format(parseISO(entry.timestamp), "MMMM yyyy")
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">History Pindahan Bulanan</h1>
      </div>

      {/* History Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold">Ringkasan Pindahan Bulanan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-medium">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg font-medium">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-medium">Tidak ada data history yang tersedia.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedHistory)
                .sort((a, b) => new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime())
                .map(([monthYear, entries]) => {
                  // Calculate total quantity and total amount for the group
                  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
                  // If price is available in entry, calculate total amount, else skip
                  const totalAmount = entries.reduce((sum, entry) => sum + (entry.quantity * (entry.price || 0)), 0);
                  return (
                    <Card key={monthYear} className="shadow-sm">
                      <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg font-semibold flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <span>{monthYear}</span>
                          <span className="text-sm font-normal text-gray-600">Total Quantity: {totalQuantity}{totalAmount > 0 ? ` | Total Amount: Rp.${totalAmount.toLocaleString("id-ID")}` : ""}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">No.</TableHead>
                                <TableHead className="font-semibold">ID Barang</TableHead>
                                <TableHead className="font-semibold text-right">Quantity</TableHead>
                                <TableHead className="font-semibold">Sumber</TableHead>
                                <TableHead className="font-semibold">Destinasi</TableHead>
                                <TableHead className="font-semibold text-right">Waktu</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {entries.map((entry) => (
                                <TableRow key={entry.pindahan_id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{entry.pindahan_id}</TableCell>
                                  <TableCell className="font-medium">{entry.item_id}</TableCell>
                                  <TableCell className="text-right font-medium">{entry.quantity}</TableCell>
                                  <TableCell className="font-medium">{entry.source}</TableCell>
                                  <TableCell className="font-medium">{entry.destination}</TableCell>
                                  <TableCell className="text-right font-medium">
                                    {format(parseISO(entry.timestamp), "dd/MM/yyyy HH:mm:ss")}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}