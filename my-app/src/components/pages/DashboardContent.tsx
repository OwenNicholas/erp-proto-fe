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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select as ShadSelect, SelectContent as ShadSelectContent, SelectItem as ShadSelectItem, SelectTrigger as ShadSelectTrigger, SelectValue as ShadSelectValue } from "@/components/ui/select";

// Define expected API response types
interface InventoryItem {
  id: string;
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
  const [priceItemId, setPriceItemId] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [quantityItemId, setQuantityItemId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [quantityLocation, setQuantityLocation] = useState("inventory_toko");

  const fetchInventory = useCallback(async () => {
    try {
      // Fetch selected inventory
      const response = await fetch(`http://103.185.52.233:3000/api/inventory/${inventoryType}`);
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

  // Compute total quantity
  const computeTotalQuantity = () => {
    return inventoryData.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Filter inventory based on search query
  const filteredInventory = inventoryData.filter((item) =>
    item.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for updating price
  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setFormError(null);
    try {
      const response = await fetch("http://103.185.52.233:3000/api/items/price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: priceItemId, price: Number(newPrice) })
      });
      if (!response.ok) throw new Error("Failed to update price");
      setFormMessage(`Harga untuk ${priceItemId} berhasil diupdate.`);
      setPriceItemId("");
      setNewPrice("");
      setShowPriceDialog(false);
      fetchInventory();
    } catch {
      setFormError("Gagal update harga. Pastikan data benar dan coba lagi.");
    }
  };

  // Handler for updating quantity
  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setFormError(null);
    try {
      const response = await fetch(`http://103.185.52.233:3000/api/items/${quantityItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: quantityLocation, quantity: Number(newQuantity) })
      });
      if (!response.ok) throw new Error("Failed to update quantity");
      setFormMessage(`Quantity untuk ${quantityItemId} berhasil diupdate.`);
      setQuantityItemId("");
      setNewQuantity("");
      setQuantityLocation("inventory_toko");
      setShowQuantityDialog(false);
      fetchInventory();
    } catch {
      setFormError("Gagal update quantity. Pastikan data benar dan coba lagi.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
            <DialogTrigger asChild>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Update Harga</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Harga Barang</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdatePrice} className="flex flex-col gap-4 mt-4">
                <Input
                  placeholder="ID Barang"
                  value={priceItemId}
                  onChange={e => setPriceItemId(e.target.value)}
                  required
                />
                <Input
                  placeholder="Harga Baru"
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  required
                />
                <DialogFooter>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Update Harga</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
            <DialogTrigger asChild>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Update Quantity</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Quantity Barang</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateQuantity} className="flex flex-col gap-4 mt-4">
                <Input
                  placeholder="ID Barang"
                  value={quantityItemId}
                  onChange={e => setQuantityItemId(e.target.value)}
                  required
                />
                <ShadSelect value={quantityLocation} onValueChange={setQuantityLocation}>
                  <ShadSelectTrigger className="w-full">
                    <ShadSelectValue placeholder="Pilih Lokasi" />
                  </ShadSelectTrigger>
                  <ShadSelectContent>
                    <ShadSelectItem value="inventory_toko">Toko</ShadSelectItem>
                    <ShadSelectItem value="inventory_tiktok">TikTok</ShadSelectItem>
                    <ShadSelectItem value="inventory_gudang">Gudang</ShadSelectItem>
                  </ShadSelectContent>
                </ShadSelect>
                <Input
                  placeholder="Quantity Baru"
                  type="number"
                  value={newQuantity}
                  onChange={e => setNewQuantity(e.target.value)}
                  required
                />
                <DialogFooter>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Update Quantity</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Form Messages */}
      {formMessage && <div className="text-green-600 font-medium">{formMessage}</div>}
      {formError && <div className="text-red-600 font-medium">{formError}</div>}

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
            <div className="flex flex-col items-end">
              <span className="text-base font-semibold text-gray-700">
                Total Quantity: {computeTotalQuantity().toLocaleString("id-ID")}
              </span>
              <span className="text-lg font-bold text-blue-600">
                Total: Rp.{computeGrandTotal().toLocaleString("id-ID")}
              </span>
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
                  <TableRow
                    key={item.item_id}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
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
    </div>
  );
};

export default DashboardContent;