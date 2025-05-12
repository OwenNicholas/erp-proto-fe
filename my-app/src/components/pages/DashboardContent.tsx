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
      // Fetch selected inventory
      const response = await fetch(`http://localhost:8080/api/inventory/${inventoryType}`);
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data: InventoryResponse = await response.json();
      setInventoryData(data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [inventoryType]);
  
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Compute total value (Quantity × Price)
  const computeTotalValue = (item: InventoryItem) => {
    return item.quantity * item.price;
  };

  const computeGrandTotal = () => {
    return inventoryData.reduce((sum, item) => sum + computeTotalValue(item), 0);
  };


  // Filter inventory based on search query
  const filteredInventory = inventoryData.filter((item) =>
    item.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConfirmDialog = () => {

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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>Koreksi Inventory</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Koreksi Inventory</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Item ID</label>
                  <Input placeholder="Masukkan Item ID" value={correctionItemId} onChange={(e) => setCorrectionItemId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input type="number" placeholder="Masukkan Quantity" value={correctionQuantity ?? ""} onChange={(e) => setCorrectionQuantity(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lokasi</label>
                  <Select
                    onValueChange={(value) => setCorrectionLocation(value as "inventory_toko" | "inventory_gudang" | "inventory_tiktok")}
                    value={correctionLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inventory_toko">Toko</SelectItem>
                      <SelectItem value="inventory_gudang">Gudang</SelectItem>
                      <SelectItem value="inventory_tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button onClick={handleOpenConfirmDialog}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>Koreksi Harga</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Koreksi Harga</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Item ID</label>
                  <Input placeholder="Masukkan Item ID" value={priceItemId} onChange={(e) => setPriceItemId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Harga Baru</label>
                  <Input type="number" placeholder="Masukkan Harga Baru" value={newPrice ?? ""} onChange={(e) => setNewPrice(Number(e.target.value))} />
                </div>
                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>Batal</Button>
                <Button onClick={() => setIsPriceConfirmDialogOpen(true)}>Simpan Perubahan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Select onValueChange={(value) => setInventoryType(value as "toko" | "gudang" | "tiktok" | "rusak")} value={inventoryType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih Inventory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toko">Toko</SelectItem>
            <SelectItem value="gudang">Gudang</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="rusak">Rusak</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Cari dengan ID Barang atau Deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Inventory Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">
              Inventory - {inventoryType.charAt(0).toUpperCase() + inventoryType.slice(1)}
            </CardTitle>
            <div className="text-lg font-bold text-blue-600">
              Total: Rp.{computeGrandTotal().toLocaleString("id-ID")}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID Barang</TableHead>
                  <TableHead className="font-semibold">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-right">Quantity</TableHead>
                  <TableHead className="font-semibold text-right">Harga Satuan</TableHead>
                  <TableHead className="font-semibold text-right">Total Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.item_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.item_id}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">Rp.{item.price.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-medium">Rp.{computeTotalValue(item).toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Konfirmasi Perubahan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">Apakah Anda yakin ingin mengubah inventory dengan data berikut?</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Item ID:</span>
                <span>{correctionItemId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Quantity:</span>
                <span>{correctionQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Lokasi:</span>
                <span>{correctionLocation}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCorrectionSubmit}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPriceConfirmDialogOpen} onOpenChange={setIsPriceConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Konfirmasi Perubahan Harga</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">Apakah Anda yakin ingin mengubah harga barang ini?</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Item ID:</span>
                <span>{priceItemId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Harga Baru:</span>
                <span>Rp.{newPrice?.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceConfirmDialogOpen(false)}>Batal</Button>
            <Button onClick={handlePriceConfirmSubmit}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardContent;