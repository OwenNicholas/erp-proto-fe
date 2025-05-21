"use client";

import * as React from "react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type TransferData = {
  item_id: string;
  quantity: number;
};

export type TransferPayload = {
  source: string;
  destination: string;
  items: TransferData[];
};

export default function PindahanContent() {
  // 🔹 State for Source and Destination
  const [source, setSource] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [items, setItems] = useState<TransferData[]>([
    { item_id: "", quantity: 0 },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 🔹 Handle input changes in the table
  const handleInputChange = (index: number, field: keyof TransferData, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // 🔹 Add new row
  const addRow = () => {
    setItems([...items, { item_id: "", quantity: 0}]);
  };

  // 🔹 Remove row
  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // 🔹 Open confirmation modal
  const handleOpenConfirm = () => {
    if (!source || !destination || source === destination) {
      setMessage("❌ Source and Destination must be different.");
      return;
    }

    if (items.some((item) => !item.item_id || item.quantity <= 0 )) {
      setMessage("❌ All fields are required.");
      return;
    }

    setIsConfirmOpen(true);
  };

  // 🔹 Confirm and Submit Transfer Request
  const handleConfirmTransfer = async () => {
    setIsConfirmOpen(false);

    const payload: TransferPayload = {
      source,
      destination,
      items: items.map(({ item_id, quantity }) => ({
        item_id,
        quantity: Number(quantity), // Ensure it's sent as a number
      })),
    };

    try {
      // ✅ Log the payload before sending
      console.log("🔄 Sending POST request (Transferring Items):", JSON.stringify(payload, null, 2));

      const response = await fetch("http://103.185.52.233:8080/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to transfer items (Status: ${response.status})`);
      }

      setMessage("✅ Items transferred successfully!");
      setItems([{ item_id: "", quantity: 0 }]); // Reset form
      setSource("");
      setDestination("");
    } catch (err) {
      setMessage("❌ Error transferring items. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pindahan Inventory</h1>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.startsWith("✅") 
            ? "bg-green-50 border border-green-200 text-green-700" 
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {/* Transfer Form */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold">Form Pindahan</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Source and Destination Selection */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dari</label>
              <Select onValueChange={setSource} value={source}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Inventories</SelectLabel>
                    <SelectItem value="gudang">Gudang</SelectItem>
                    <SelectItem value="toko">Toko</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ke</label>
              <Select onValueChange={setDestination} value={destination}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Destinasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Inventories</SelectLabel>
                    <SelectItem value="gudang">Gudang</SelectItem>
                    <SelectItem value="toko">Toko</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Daftar Barang</h3>
              <Button 
                variant="outline" 
                onClick={addRow}
                className="flex items-center gap-2"
              >
                <AiOutlinePlus className="w-4 h-4" />
                <span>Tambah Barang</span>
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Kode Barang</TableHead>
                    <TableHead className="font-semibold">Quantity</TableHead>
                    <TableHead className="font-semibold w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Kode Barang"
                          value={item.item_id}
                          onChange={(e) => handleInputChange(index, "item_id", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleInputChange(index, "quantity", Number(e.target.value))}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeRow(index)} 
                          disabled={items.length <= 1}
                          className="h-8 w-8"
                        >
                          <AiOutlineMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleOpenConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Konfirmasi Pindahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Konfirmasi Pindahan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">Apakah Anda yakin ingin memindahkan barang dengan detail berikut?</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Dari:</span>
                <span className="capitalize">{source}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Ke:</span>
                <span className="capitalize">{destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Jumlah Barang:</span>
                <span>{items.length}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Batal</Button>
            <Button 
              onClick={handleConfirmTransfer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}