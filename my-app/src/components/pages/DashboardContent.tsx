"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

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
  const [inventoryType, setInventoryType] = useState<"toko" | "gudang" | "tiktok" | "rusak">("toko");
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Koreksi Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [correctionItemId, setCorrectionItemId] = useState<string>("");
  const [correctionQuantity, setCorrectionQuantity] = useState<number | null>(null);
  const [correctionLocation, setCorrectionLocation] = useState<"inventory_toko" | "inventory_gudang" | "inventory_tiktok">("inventory_toko");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

   // Koreksi Harga States
   const [isPriceDialogOpen, setIsPriceDialogOpen] = useState<boolean>(false);
   const [priceItemId, setPriceItemId] = useState<string>("");
   const [newPrice, setNewPrice] = useState<number | null>(null);
   const [isPriceConfirmDialogOpen, setIsPriceConfirmDialogOpen] = useState<boolean>(false);

   const fetchInventory = useCallback(async () => {
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
  }, [inventoryType]); // ✅ Dependency added
  
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Compute total value (Quantity × Price)
  const computeTotalValue = (item: InventoryItem) => {
    return item.quantity * item.price;
  };


  // Filter inventory based on search query
  const filteredInventory = inventoryData.filter((item) =>
    item.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConfirmDialog = () => {
    console.log("DEBUG -> Item ID:", correctionItemId);
    console.log("DEBUG -> Quantity:", correctionQuantity);
    console.log("DEBUG -> Location:", correctionLocation);

    if (!correctionItemId || correctionQuantity === null || !correctionLocation) {
      setErrorMessage("❌ Item ID, Quantity, dan Lokasi harus diisi!");
      return;
    }
    setErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  // 🔹 Handle Koreksi (Inventory Correction)
  const handleCorrectionSubmit = async () => {
    setIsConfirmDialogOpen(false);

    console.log("Item ID:", correctionItemId);
    console.log("Quantity:", correctionQuantity);
    console.log("Location:", correctionLocation);
    if (!correctionItemId || correctionQuantity === null) {
      setErrorMessage("Item ID dan Quantity harus diisi!");
      return;
    }
    const payload = {
      location: correctionLocation, 
      quantity: correctionQuantity,
    };
  

    try {
      const response = await fetch(`http://localhost:8080/api/items/${correctionItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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


  const handlePriceConfirmSubmit = async () => {
    setIsPriceConfirmDialogOpen(false);
    if (!priceItemId || newPrice === null || newPrice <= 0) {
      setErrorMessage("❌ Item ID dan Harga Baru harus diisi!");
      return;
    }
    const payload = {
      item_id: priceItemId,
      price: newPrice,
    };

    console.log("📤 Sending PUT request to /api/items/price with payload:", payload);

    try {
      const response = await fetch(`http://localhost:8080/api/items/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: priceItemId,
          price: newPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui harga");
      }

      fetchInventory();
      setIsPriceDialogOpen(false);
      setPriceItemId("");
      setNewPrice(null);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error updating price:", error);
      setErrorMessage("Gagal memperbarui harga. Coba lagi.");
    }
  };


  return (
    <div className="p-4 text-lg font-semibold">
      {/* Koreksi Buttons */}
      <div className="flex gap-4 mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Koreksi Inventory</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Koreksi Inventory</DialogTitle>
            </DialogHeader>
            <Input placeholder="Item ID" value={correctionItemId} onChange={(e) => setCorrectionItemId(e.target.value)} />
            <Input type="number" placeholder="Quantity" value={correctionQuantity ?? ""} onChange={(e) => setCorrectionQuantity(Number(e.target.value))} />
            <Select
              onValueChange={(value) => {
                console.log("Selected location:", value); // Debugging log
                setCorrectionLocation(value as "inventory_toko" | "inventory_gudang" | "inventory_tiktok");
              }}
              value={correctionLocation} // No need for ?? "inventory_toko" since we set a default in useState
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Lokasi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory_toko">Toko</SelectItem>
                <SelectItem value="inventory_gudang">Gudang</SelectItem>
                <SelectItem value="inventory_tiktok">TikTok</SelectItem>
              </SelectContent>
            </Select>
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            <Button onClick={handleOpenConfirmDialog} className="w-full mt-4">Simpan Perubahan</Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Koreksi Harga</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Koreksi Harga</DialogTitle>
            </DialogHeader>
            <Input placeholder="Item ID" value={priceItemId} onChange={(e) => setPriceItemId(e.target.value)} />
            <Input type="number" placeholder="Harga Baru" value={newPrice ?? ""} onChange={(e) => setNewPrice(Number(e.target.value))} />
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            <Button onClick={() => setIsPriceConfirmDialogOpen(true)} className="w-full mt-4">Simpan Perubahan</Button>
          </DialogContent>
        </Dialog>
      </div>
      {/* Dropdown Selector */}
      <div className="flex justify-between items-center mb-4">
        <Select onValueChange={(value) => setInventoryType(value as "toko" | "gudang" | "tiktok" | "rusak" )} value={inventoryType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Inventory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toko">Toko</SelectItem>
            <SelectItem value="gudang">Gudang</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="rusak">Rusak</SelectItem>
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

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Perubahan</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin mengubah inventory dengan data berikut?</p>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            <li><strong>Item ID:</strong> {correctionItemId}</li>
            <li><strong>Quantity:</strong> {correctionQuantity}</li>
            <li><strong>Lokasi:</strong> {correctionLocation}</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Batal</Button>
            <Button className="bg-blue-600 text-white" onClick={handleCorrectionSubmit}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isPriceConfirmDialogOpen} onOpenChange={setIsPriceConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Perubahan Harga</DialogTitle>
          </DialogHeader>
          <p>Apakah Anda yakin ingin mengubah harga barang ini?</p>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            <li><strong>Item ID:</strong> {priceItemId}</li>
            <li><strong>Harga Baru:</strong> Rp.{newPrice?.toLocaleString("id-ID")}</li>
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceConfirmDialogOpen(false)}>Batal</Button>
            <Button className="bg-blue-600 text-white" onClick={handlePriceConfirmSubmit}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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