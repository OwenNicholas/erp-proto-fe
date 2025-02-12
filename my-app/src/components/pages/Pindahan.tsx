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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// 🔹 Define Transfer Data Type
export type TransferData = {
  source: string;
  destination: string;
  item_id: string;
  quantity: number;
  description: string;
};

export default function PindahanContent() {
  // 🔹 State for Input Fields
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 🔹 Confirmation Modal State

  // 🔹 Handle Form Submission (Opens Confirmation Modal)
  const handleOpenConfirm = () => {
    if (!source || !destination || source === destination) {
      setMessage("❌ Source and Destination must be different.");
      return;
    }

    if (!itemId || !quantity || !description) {
      setMessage("❌ All fields are required.");
      return;
    }

    setIsConfirmOpen(true);
  };

  // 🔹 Confirm Transfer and Submit Data
  const handleConfirmTransfer = async () => {
    setIsConfirmOpen(false); // Close the modal

    const transferData: TransferData = {
      source,
      destination,
      item_id: itemId,
      quantity: Number(quantity),
      description,
    };

    try {
      const response = await fetch("http://localhost:8080/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferData),
      });

      if (!response.ok) {
        throw new Error(`Failed to transfer item (Status: ${response.status})`);
      }

      setMessage("✅ Item transferred successfully!");
      setItemId("");
      setQuantity("");
      setDescription("");
      setSource("");
      setDestination("");
    } catch (err) {
      setMessage("❌ Error transferring item. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Pindahan Inventory</h2>

      {/* 🔹 Display Success/Error Message */}
      {message && <div className={`text-center mb-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>{message}</div>}

      {/* 🔹 Select Source Inventory */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Dari</label>
        <Select onValueChange={setSource}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Inventories</SelectLabel>
              <SelectItem value="Gudang">Gudang</SelectItem>
              <SelectItem value="Toko">Toko</SelectItem>
              <SelectItem value="Tiktok">TikTok</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 🔹 Select Destination Inventory */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Ke</label>
        <Select onValueChange={setDestination}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Inventories</SelectLabel>
              <SelectItem value="Gudang">Gudang</SelectItem>
              <SelectItem value="Toko">Toko</SelectItem>
              <SelectItem value="Tiktok">TikTok</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
        Pindahkan
      </Button>

      {/* 🔹 Confirmation Modal */}
      {isConfirmOpen && (
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Transfer</DialogTitle>
            </DialogHeader>
            <p>Anda yakin memindahkan <strong>{quantity}x {itemId}</strong> dari <strong>{source}</strong> ke <strong>{destination}</strong>?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 text-white" onClick={handleConfirmTransfer}>
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}