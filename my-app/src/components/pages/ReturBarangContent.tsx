"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

// 🔹 Define Return Data Type
export type InventoryData = {
  sale_id: string;
  item_id: string;
  location: string;
  quantity: number;
  condition: "Rusak" | "Tidak Rusak";
};

export default function ReturBarangContent() {
  // 🔹 State for Input Fields
  const [items, setItems] = useState<InventoryData[]>([
    { sale_id: "", item_id: "", location: "inventory_gudang", quantity: 0, condition: "Tidak Rusak" },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 🔹 Handle input changes in the table
  const handleInputChange = (index: number, field: keyof InventoryData, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // 🔹 Add new row
  const addRow = () => {
    setItems([...items, { sale_id: "", item_id: "", location: "inventory_gudang", quantity: 0, condition: "Tidak Rusak" }]);
  };

  // 🔹 Remove row
  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // 🔹 Open confirmation modal
  const handleOpenConfirm = () => {
    if (items.some((item) => !item.sale_id || !item.item_id || item.quantity <= 0)) {
      setMessage("❌ Sale ID, Item ID, and Quantity are required.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // 🔹 Confirm and Submit Return Request
  const handleConfirmReturn = async () => {
    setIsConfirmOpen(false);

    try {
      // ✅ Log the payload before sending
      console.log("🔄 Sending PUT request (Returning Items):", JSON.stringify(items, null, 2));

      const damagedItems = items
      .filter((item) => item.condition === "Rusak")
      .map(({ item_id, quantity, sale_id }) => ({
        item_id,
        quantity,
        sale_id: Number(sale_id),
      }));

      const normalItems = items
      .filter((item) => item.condition === "Tidak Rusak")
      .map(({ item_id, quantity, sale_id }) => ({
        item_id,
        quantity,
        sale_id: Number(sale_id),
      }));

      if (damagedItems.length > 0) {
        console.log("🚨 Sending request for DAMAGED items...");
        const payload = { 
          items: damagedItems.map(({ item_id, quantity, sale_id }) => ({ item_id, quantity, sale_id }))
        };
        console.log(payload);
        const responseDamaged = await fetch("http://103.185.52.233:8080/api/items/rusak", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
  
        if (!responseDamaged.ok) {
          throw new Error(`Failed to return DAMAGED items (Status: ${responseDamaged.status})`);
        }
      }

      if (normalItems.length > 0) {
        console.log("✅ Sending request for NORMAL returned items...");

        const payload = { 
          items: normalItems.map(({ item_id, quantity, sale_id }) => ({ item_id, quantity, sale_id }))
        };
        console.log(payload);

        const responseNormal = await fetch("http://103.185.52.233:8080/api/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( payload ),
        });
  
        if (!responseNormal.ok) {
          throw new Error(`Failed to return NORMAL items (Status: ${responseNormal.status})`);
        }
      }

      setMessage("✅ Item return request submitted successfully!");
      setItems([{ sale_id: "", item_id: "", location: "inventory_gudang", quantity: 0, condition: "Tidak Rusak" }]); // Reset form
    } catch (err) {
      setMessage("❌ Error returning items. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Retur Barang</h2>

      {message && (
        <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}

      {/* Table for Item Input */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Penjualan</TableHead>
            <TableHead>Kode Barang</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="text"
                  placeholder="No. Penjualan"
                  value={item.sale_id}
                  onChange={(e) => handleInputChange(index, "sale_id", e.target.value)}
                />
              </TableCell>
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
                <Select
                  value={item.condition}
                  onValueChange={(value) => handleInputChange(index, "condition", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rusak">Rusak</SelectItem>
                    <SelectItem value="Tidak Rusak">Tidak Rusak</SelectItem>
                  </SelectContent>
                </Select>
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
            <DialogTitle>Konfirmasi Retur Produk</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin mengembalikan barang ke Inventory Gudang?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleConfirmReturn}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}