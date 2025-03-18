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

      const response = await fetch("http://localhost:8080/api/inventory", {
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
    <div className="w-full max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Pindahan Inventory</h2>

      {message && (
        <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}

      {/* 🔹 Source and Destination Dropdowns (Side by Side) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Dari</label>
          <Select onValueChange={setSource}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Pilih Sumber" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Inventories</SelectLabel>
                <SelectItem value="gudang">Gudang</SelectItem>
                <SelectItem value="toko">Toko</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium">Ke</label>
          <Select onValueChange={setDestination}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Pilih Destinasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Inventories</SelectLabel>
                <SelectItem value="gudang">Gudang</SelectItem>
                <SelectItem value="toko">Toko</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table for Item Input */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Barang</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="text"
                  placeholder="Kode Barang"
                  value={item.item_id}
                  onChange={(e) => handleInputChange(index, "item_id", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleInputChange(index, "quantity", Number(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                  <AiOutlineMinus />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Buttons at the bottom */}
      <div className="flex justify-between mt-4">
        <Button className="bg-gray-800 text-white px-4 py-2" onClick={handleOpenConfirm}>
          Konfirmasi
        </Button>
        <Button className="bg-gray-800 text-white px-4 py-2 flex items-center gap-2" onClick={addRow}>
          <AiOutlinePlus />
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pindahan</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin memindahkan barang ke lokasi baru?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handleConfirmTransfer}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}