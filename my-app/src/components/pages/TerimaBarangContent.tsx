"use client";

import * as React from "react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// 🔹 Define Inventory Data Type
export type InventoryData = {
  item_id?: string;
  price?: number; 
  quantity: number;
  description?: string; 
  location?: string; 
};

export default function TerimaBarangContent() {
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isExistingItem, setIsExistingItem] = useState<boolean | null>(null);

  // Check if Item Exists in DB
  const checkItemExists = async (itemId: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/api/items");

      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }

      const data = await response.json();
      const items = data.data || [];

      return items.some((item: InventoryData) => item.item_id === itemId);
    } catch (error) {
      console.error("Error checking item:", error);
      return false; // Assume item does not exist if there's an error
    }
  };

  // Open Confirmation Modal
  const handleOpenConfirm = async () => {
    if (!itemId || !quantity) {
      setMessage("❌ All fields are required.");
      return;
    }

    // Check if item exists and update state
    const exists = await checkItemExists(itemId);
    setIsExistingItem(exists);

    setIsConfirmOpen(true);
  };

  // 🔹 Confirm and Submit Inventory Reception
  const handleConfirmReceive = async () => {
    setIsConfirmOpen(false); // Close the modal

    let inventoryData: InventoryData;

    let method = "POST"; // Create new item
    let endpoint = "http://localhost:8080/api/items";

    if (isExistingItem) {
      method = "PUT"; // Update existing item
      endpoint = `http://localhost:8080/api/items/${itemId}`;
      inventoryData = {
        quantity: Number(quantity),
        location: "inventory_gudang", 
      };
    } else {
      inventoryData = {
        item_id: itemId,
        price: Number(price),
        quantity: Number(quantity),
        description: description,
      };
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inventoryData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method === "POST" ? "create" : "update"} item (Status: ${response.status})`);
      }

      setMessage(`✅ Item successfully ${isExistingItem ? "updated" : "added"} to inventory!`);
      setItemId("");
      setQuantity("");
      setDescription("");
      setPrice("");
    } catch (err) {
      setMessage("❌ Error updating item. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Terima Barang</h2>

      {/* Display Success/Error Message */}
      {message && <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</div>}

      {/* Item ID */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Kode Barang</label>
        <Input
          type="text"
          placeholder="Isi Kode Barang..."
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          className="w-full mt-1"
        />
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Quantity</label>
        <Input
          type="number"
          placeholder="Isi Quantity..."
          value={quantity}
          onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
          className="w-full mt-1"
        />
      </div>

      {/* Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Harga Satuan</label>
          <Input
            type="number"
            placeholder="Isi Harga Satuan..."
            value={price}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
            className="w-full mt-1"
          />
        </div>
      

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Keterangan</label>
        <Input
          type="text"
          placeholder="Isi Keterangan..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mt-1"
        />
      </div>

      {/* Submit Button (Opens Confirmation Modal) */}
      <Button onClick={handleOpenConfirm} className="w-full bg-blue-600 text-white py-2 mt-4">
        Tambah
      </Button>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Terima Barang</DialogTitle>
            </DialogHeader>
            <p>
              Anda yakin {isExistingItem ? "memperbarui" : "menambahkan"} <strong>{quantity}x {itemId}</strong> ke Inventory Gudang?
              <br />
              {isExistingItem ? (
                <strong>Lokasi:</strong>
              ) : (
                <>
                  <strong>Harga:</strong> {price} <br />
                  <strong>Deskripsi:</strong> {description}
                </>
              )}
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