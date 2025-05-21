"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

interface HistoryEntry {
  pindahan_id: number;
  item_id: string;
  quantity: number;
  timestamp: string;
  source: string;
  destination: string;
  group_id: string;
  price?: number;
}

export default function HistoryPindahanHarianContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://103.185.52.233:8080/api/history");
      if (!response.ok) throw new Error("Failed to fetch history data");

      const data = await response.json();
      // Sort the data by timestamp in descending order (newest first)
      const sortedData = (data.data || []).sort((a: HistoryEntry, b: HistoryEntry) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setHistory(sortedData);
    } catch (err) {
      setError("Failed to load history data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter history by selected date
  const filteredHistory = history.filter(entry =>
    isSameDay(parseISO(entry.timestamp), selectedDate)
  );

  // 🔹 Group history entries by `group_id` (only for filtered entries)
  const groupedHistory = filteredHistory.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    if (!acc[entry.group_id]) acc[entry.group_id] = [];
    acc[entry.group_id].push(entry);
    return acc;
  }, {});

  // Calculate pagination
  const totalGroups = Object.keys(groupedHistory).length;
  const totalPages = Math.ceil(totalGroups / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentGroups = Object.entries(groupedHistory).slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">History Pindahan Harian</h1>
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

      {/* History Section */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold">Ringkasan Pindahan Harian</CardTitle>
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
          ) : Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-medium">Tidak ada data history yang tersedia.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentGroups.map(([groupId, entries]) => {
                // Calculate total quantity and total amount for the group
                const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
                // If price is available in entry, calculate total amount, else skip
                const totalAmount = entries.reduce((sum, entry) => sum + (entry.quantity * (entry.price || 0)), 0);
                // Use the date from the first entry
                const dateLabel = entries.length > 0 ? format(parseISO(entries[0].timestamp), "dd/MM/yyyy") : groupId;
                return (
                  <Card key={groupId} className="shadow-sm">
                    <CardHeader className="bg-gray-50 border-b">
                      <CardTitle className="text-lg font-semibold flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span>{dateLabel}</span>
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Back
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}