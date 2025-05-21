"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  item_id: string;
  quantity: number;
  description: string;
  price: number;
}

export default function InventoryItemEditPage() {
  const { item_id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/items/${item_id}`);
        if (!res.ok) throw new Error("Failed to fetch item data");
        const data = await res.json();
        setItem(data.data);
      } catch {
        setError("Failed to load item data");
      } finally {
        setLoading(false);
      }
    };
    if (item_id) fetchItem();
  }, [item_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!item) return;
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: name === "quantity" || name === "price" ? Number(value) : value,
    });
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/items/${item_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to update item");
      router.back();
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!item) return <div className="p-8 text-center">Item not found.</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-xl font-semibold">Edit Inventory Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">ID Barang</label>
            <Input name="item_id" value={item.item_id} onChange={handleChange} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input name="description" value={item.description} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input name="quantity" type="number" value={item.quantity} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Harga Satuan</label>
            <Input name="price" type="number" value={item.price} onChange={handleChange} />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 