"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define expected API response types
interface InventoryItem {
  item_id: string;
  quantity: number;
  description: string;
  price: number;
}

interface InventoryResponse {
  meta: {
    code: number;
    status: string;
  };
  data: InventoryItem[];
}

const DashboardContent = () => {
  const [inventoryType, setInventoryType] = useState<"toko" | "gudang" | "tiktok">("toko"); // Default to Toko
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Koreksi Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [correctionItemId, setCorrectionItemId] = useState<string>("");
  const [correctionQuantity, setCorrectionQuantity] = useState<number | null>(null);
  const [correctionLocation, setCorrectionLocation] = useState<"toko" | "gudang" | "tiktok">("toko");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, [inventoryType]); // Fetch when inventory type changes

  const fetchInventory = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inventory/${inventoryType}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data: InventoryResponse = await response.json();
      setInventoryData(data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Compute total value (Quantity × Price)
  const computeTotalValue = (item: InventoryItem) => {
    return item.quantity * item.price;
  };

  // Filter inventory based on search query
  const filteredInventory = inventoryData.filter((item) =>
    item.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔹 Handle Koreksi (Inventory Correction)
  const handleCorrectionSubmit = async () => {
    if (!correctionItemId || correctionQuantity === null) {
      setErrorMessage("Item ID dan Quantity harus diisi!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/inventory/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: correctionItemId,
          quantity: correctionQuantity,
          location: correctionLocation,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui inventory");
      }

      // ✅ Refresh Inventory Data
      fetchInventory();
      setIsDialogOpen(false);
      setCorrectionItemId("");
      setCorrectionQuantity(null);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error updating inventory:", error);
      setErrorMessage("Gagal memperbarui inventory. Coba lagi.");
    }
  };

  return (
    <div className="p-4 text-lg font-semibold">
      {/* Koreksi Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-4">Koreksi Inventory</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Koreksi Inventory</DialogTitle>
          </DialogHeader>

          {/* Input Fields */}
          <div className="space-y-4">
            <Input
              placeholder="Item ID"
              value={correctionItemId}
              onChange={(e) => setCorrectionItemId(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={correctionQuantity ?? ""}
              onChange={(e) => setCorrectionQuantity(Number(e.target.value))}
            />
            <Select onValueChange={(value) => setCorrectionLocation(value as "toko" | "gudang" | "tiktok")} value={correctionLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toko">Toko</SelectItem>
                <SelectItem value="gudang">Gudang</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          </div>

          {/* Submit Button */}
          <Button onClick={handleCorrectionSubmit} className="w-full mt-4">
            Simpan Perubahan
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dropdown Selector */}
      <div className="flex justify-between items-center mb-4">
        <Select onValueChange={(value) => setInventoryType(value as "toko" | "gudang" | "tiktok")} value={inventoryType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Inventory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toko">Toko</SelectItem>
            <SelectItem value="gudang">Gudang</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Input */}
        <Input
          placeholder="Cari pakai ID Barang ato Deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[300px]"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory - {inventoryType.charAt(0).toUpperCase() + inventoryType.slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Barang</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.item_id}>
                  <TableCell>{item.item_id}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>Rp.{item.price.toLocaleString("id-ID")}</TableCell>
                  <TableCell>Rp.{computeTotalValue(item).toLocaleString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;