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
      const response = await fetch("http://localhost:8080/api/history");
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
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
      <div className="w-full max-w-5xl">
        <Card className="shadow-md rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">History Pindahan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : history.length === 0 ? (
              <div className="text-center text-gray-500">No history records found.</div>
            ) : (
              <div className="overflow-x-auto">
                {Object.entries(groupedHistory)
                  .sort(
                    (a, b) =>
                      new Date(b[1][0].timestamp).getTime() - new Date(a[1][0].timestamp).getTime()
                  ) // Sort months in descending order
                  .map(([monthYear, entries]) => (
                    <div key={monthYear} className="mb-6">
                      <h3 className="text-lg font-semibold my-4 border-b pb-2">{monthYear}</h3>
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-left">No.</TableHead>
                            <TableHead className="text-left">ID Barang</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-left">Sumber</TableHead>
                            <TableHead className="text-left">Destinasi</TableHead>
                            <TableHead className="text-right">Waktu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entries.map((entry) => (
                            <TableRow key={entry.pindahan_id}>
                              <TableCell>{entry.pindahan_id}</TableCell>
                              <TableCell>{entry.item_id}</TableCell>
                              <TableCell className="text-right">{entry.quantity}</TableCell>
                              <TableCell>{entry.source}</TableCell>
                              <TableCell>{entry.destination}</TableCell>
                              <TableCell className="text-right">
                                {format(parseISO(entry.timestamp), "dd/MM/yyyy HH:mm:ss")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}