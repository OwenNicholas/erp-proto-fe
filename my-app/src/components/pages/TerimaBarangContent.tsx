"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

// 🔹 Define Inventory Data Type
export type InventoryData = {
  item_id: string;
  price: number;
  quantity: number;
  description: string;
  location?: string;
};

export default function TerimaBarangContent() {
  const [items, setItems] = useState<InventoryData[]>([
    { item_id: "", price: 0, quantity: 0, description: "" },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [existingItems, setExistingItems] = useState<InventoryData[]>([]);
  const [newItems, setNewItems] = useState<InventoryData[]>([]);

  // 🔹 Check if Item Exists in DB
  const checkItemExists = async (itemId: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/api/items");
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      const items = data.data || [];

      return items.some((item: InventoryData) => item.item_id === itemId);
    } catch (error) {
      console.error("Error checking item:", error);
      return false;
    }
  };

  // 🔹 Handle input changes in the table
  const handleInputChange = (index: number, field: keyof InventoryData, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // 🔹 Add new row
  const addRow = () => {
    setItems([...items, { item_id: "", price: 0, quantity: 0, description: "" }]);
  };

  // 🔹 Remove row
  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // 🔹 Open confirmation modal
  const handleOpenConfirm = async () => {
    if (items.some((item) => !item.item_id || item.quantity <= 0)) {
      setMessage("❌ All fields are required.");
      return;
    }

    try {
      // Check all item_id existence in parallel
      const existenceChecks = await Promise.all(
        items.map(async (item) => ({
          item,
          exists: await checkItemExists(item.item_id),
        }))
      );

      // Separate existing and new items
      const existing = existenceChecks.filter((check) => check.exists).map((check) => check.item);
      const newOnes = existenceChecks.filter((check) => !check.exists).map((check) => check.item);

      setExistingItems(existing);
      setNewItems(newOnes);
      setIsConfirmOpen(true);
    } catch (error) {
      setMessage("❌ Error checking item existence.");
      console.error(error);
    }
  };

  // 🔹 Confirm and Submit Inventory Reception
  const handleConfirmReceive = async () => {
    setIsConfirmOpen(false);

    try {
      const requests: Promise<Response>[] = [];

      // If there are existing items, send a **single PUT request**
      if (existingItems.length > 0) {
        console.log("🔄 Sending PUT request (Updating Items):", { items: existingItems });

        requests.push(
          fetch("http://localhost:8080/api/items", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: existingItems.map(({ item_id, quantity }) => ({ item_id, quantity }))
            }),
          })
        );
      }

      // If there are new items, send a **single POST request**
      if (newItems.length > 0) {
        console.log("🆕 Sending POST request (Creating New Items):", {
          items: newItems,
        });
      
        requests.push(
          fetch("http://localhost:8080/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: newItems }),
          })
        );
      }

      // Send both requests (if applicable) in parallel
      const responses = await Promise.all(requests);

      // Check for errors
      if (responses.some((res) => !res.ok)) {
        throw new Error("Some inventory updates failed.");
      }

      setMessage("✅ Inventory successfully updated!");
      setItems([{ item_id: "", price: 0, quantity: 0, description: "" }]); // Reset form
    } catch (err) {
      setMessage("❌ Error updating inventory. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Terima Barang</h2>

      {message && (
        <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}

      {/* Table for Item Input */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode Barang</TableHead>
            <TableHead>Harga Satuan</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Keterangan</TableHead>
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
                  placeholder="Harga Satuan"
                  value={item.price}
                  onChange={(e) => handleInputChange(index, "price", Number(e.target.value))}
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
                <Input
                  type="text"
                  placeholder="Keterangan"
                  value={item.description}
                  onChange={(e) => handleInputChange(index, "description", e.target.value)}
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
          <AiOutlinePlus/>
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Terima Barang</DialogTitle>
          </DialogHeader>
          <p>Anda yakin ingin memperbarui/menambahkan barang ke Inventory Gudang?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" onClick={handleConfirmReceive}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}