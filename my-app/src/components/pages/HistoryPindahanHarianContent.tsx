"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HistoryEntry {
  pindahan_id: number;
  item_id: string;
  quantity: number;
  timestamp: string;
  source: string;
  destination: string;
  group_id: string;
}

export default function HistoryPindahanHarianContent() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

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

  // 🔹 Group history entries by `group_id`
  const groupedHistory = history.reduce<Record<string, HistoryEntry[]>>((acc, entry) => {
    if (!acc[entry.group_id]) acc[entry.group_id] = [];
    acc[entry.group_id].push(entry);
    return acc;
  }, {});

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
              {Object.entries(groupedHistory).map(([groupId, entries]) => (
                <Card key={groupId} className="shadow-sm">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg font-semibold">
                      Group ID: <span className="font-mono">{groupId}</span>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}