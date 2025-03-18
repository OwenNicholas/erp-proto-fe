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
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
      <div className="w-full max-w-4xl"> {/* 🔹 Match size with Bulanan */}
        <Card className="shadow-md rounded-lg border border-gray-300">
          <CardHeader className="text-center py-4">
            <CardTitle className="text-xl font-semibold">History Pindahan Harian</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* 🔹 Date Picker */}
            <div className="flex justify-center mb-4">
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

            {loading ? (
              <div className="text-center text-gray-500 text-lg">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 text-lg">{error}</div>
            ) : Object.keys(groupedHistory).length === 0 ? (
              <div className="text-center text-gray-500 text-lg font-semibold py-4">
                ❌ No history records found.
              </div>
            ) : (
              Object.entries(groupedHistory).map(([groupId, entries]) => (
                <Card key={groupId} className="mb-4 shadow-md rounded-lg border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-md font-semibold">
                      Group ID: <span className="font-mono">{groupId}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="overflow-x-auto">
                      <Table className="w-full text-md">
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="px-4 py-2">No.</TableHead>
                            <TableHead className="px-4 py-2">No. Barang</TableHead>
                            <TableHead className="px-4 py-2 text-right">Quantity</TableHead>
                            <TableHead className="px-4 py-2">Sumber</TableHead>
                            <TableHead className="px-4 py-2">Destinasi</TableHead>
                            <TableHead className="px-4 py-2 text-right">Waktu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entries.map((entry) => (
                            <TableRow key={entry.pindahan_id} className="border-b">
                              <TableCell className="px-4 py-2">{entry.pindahan_id}</TableCell>
                              <TableCell className="px-4 py-2">{entry.item_id}</TableCell>
                              <TableCell className="px-4 py-2 text-right">{entry.quantity}</TableCell>
                              <TableCell className="px-4 py-2">{entry.source}</TableCell>
                              <TableCell className="px-4 py-2">{entry.destination}</TableCell>
                              <TableCell className="px-4 py-2 text-right">
                                {format(parseISO(entry.timestamp), "dd/MM/yyyy HH:mm:ss")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}