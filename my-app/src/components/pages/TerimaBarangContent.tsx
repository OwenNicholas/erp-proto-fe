"use client";

import * as React from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// 🔹 Define Inventory Data Type
export type InventoryData = {
  item_id: string;
  quantity: number;
  description: string;
};

export default function TerimaBarangContent() {
  // 🔹 State for Input Fields
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 🔹 Confirmation Modal State

  // 🔹 Open Confirmation Modal
  const handleOpenConfirm = () => {
    if (!itemId || !quantity || !description) {
      setMessage("❌ All fields are required.");
      return;
    }
    setIsConfirmOpen(true);
  };

  // 🔹 Confirm and Submit Inventory Reception
  const handleConfirmReceive = async () => {
    setIsConfirmOpen(false); // Close the modal

    const inventoryData: InventoryData = {
      item_id: itemId,
      quantity: Number(quantity),
      description,
    };

    try {
      const response = await fetch("http://localhost:8080/api/inventory_gudang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add inventory (Status: ${response.status})`);
      }

      setMessage("✅ Item added to inventory successfully!");
      setItemId("");
      setQuantity("");
      setDescription("");
    } catch (err) {
      setMessage("❌ Error adding item. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Terima Barang</h2>

      {/* 🔹 Display Success/Error Message */}
      {message && <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</div>}

      {/* 🔹 Item ID */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Item ID</label>
        <Input
          type="text"
          placeholder="Enter Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full mt-1"
        />
      </div>

      {/* 🔹 Quantity */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Quantity</label>
        <Input
          type="number"
          placeholder="Enter Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
          className="w-full mt-1"
        />
      </div>

      {/* 🔹 Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Description</label>
        <Input
          type="text"
          placeholder="Enter Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1"
        />
      </div>

      {/* 🔹 Submit Button (Opens Confirmation Modal) */}
      <Button onClick={handleOpenConfirm} className="w-full bg-blue-600 text-white py-2 mt-4">
        Tambah
      </Button>

      {/* 🔹 Confirmation Modal */}
      {isConfirmOpen && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Terima Barang</DialogTitle>
            </DialogHeader>
            <p>
              Anda yakin menambah <strong>{quantity}x {itemId}</strong> ke Inventory Gudang?
              <br />
              <strong>Deskripsi:</strong> {description}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 text-white" onClick={handleConfirmReceive}>
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}