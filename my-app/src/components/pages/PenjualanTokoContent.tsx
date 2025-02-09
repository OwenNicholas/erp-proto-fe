"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Label } from "@/components/ui/label"

// Sample initial data
const initialInvoices = [
  { invoice: "A001", hargaSatuan: "Rp.250.000", jumlah: "1", discountPerItem: "0", total: "Rp.250.000", description: "" },
  { invoice: "A002", hargaSatuan: "Rp.150.000", jumlah: "1", discountPerItem: "0", total: "Rp.150.000", description: "" },
];

export default function PenjualanTokoContent() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"none" | "percent" | "amount">("none");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Final confirmation dialog
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Function to safely parse a price string into a number
  const parsePrice = (value: string | undefined): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/Rp\.|,/g, "").replace(".000", "")) || 0;
  };

  // Function to format as Rp. currency
  const formatRupiah = (value: number): string => {
    return `Rp.${value.toLocaleString("id-ID")}`;
  };

  // Handle input changes
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInvoices = [...invoices];
    updatedInvoices[index] = { ...updatedInvoices[index], [field]: value };

    // Recalculate total when hargaSatuan, jumlah, or discount changes
    if (["hargaSatuan", "jumlah", "discountPerItem"].includes(field)) {
      const price = parsePrice(updatedInvoices[index].hargaSatuan);
      const quantity = parseInt(updatedInvoices[index].jumlah) || 0;
      const discount = parsePrice(updatedInvoices[index].discountPerItem);

      // Calculate new total
      const newTotal = price * quantity - discount * quantity;
      updatedInvoices[index].total = `${formatRupiah(Math.max(newTotal, 0))}.000`;
    }

    setInvoices(updatedInvoices);
  };

  // Add a new row
  const addRow = () => {
    setInvoices([
      ...invoices,
      { invoice: `INV00${invoices.length + 1}`, hargaSatuan: "Rp.0.000", jumlah: "0", discountPerItem: "0", total: "Rp.0.000", description: "" },
    ]);
  };

  // Remove a row
  const removeRow = (index: number) => {
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
  };

  // Reset discount
  const handleDiscountCancel = () => {
    setDiscountType("none");
    setDiscountPercent(0);
    setDiscountAmount(0);
    setInvoices(
      invoices.map((invoice) => ({ ...invoice, discountPerItem: "0" })) // Reset discountPerItem for all rows
    );
  };

  // Calculate the grand total with applied discounts
  const calculateGrandTotal = (): string => {
    const subtotal = invoices.reduce((sum, row) => sum + parsePrice(row.total), 0);

    let discountedTotal = subtotal;
    if (discountType === "percent") {
      const discountValue = (subtotal * discountPercent) / 100;
      discountedTotal = subtotal - discountValue;
    } else if (discountType === "amount") {
      discountedTotal = subtotal - discountAmount;
    }

    return `${formatRupiah(Math.max(discountedTotal, 0))}.000`;
  };

  const handleConfirm = async () => {
    setIsConfirmDialogOpen(false);
    setIsSubmitting(true);
  
    try {
      // Process invoices for the backend
      const processedInvoices = invoices.map((invoice) => ({
        item_id: invoice.invoice,
        price: parseInt(`${parsePrice(invoice.hargaSatuan)}000`), // Convert to number
        quantity: parseInt(invoice.jumlah) || 0, // Convert to integer
        discount_per_item: parseInt(`${parsePrice(invoice.discountPerItem)}000`), // Convert to number
        total: parseInt(`${parsePrice(invoice.total)}000`), // Convert to number
        description: invoice.description,
      }));
  
      // Calculate total discount
      const totalDiscount =
        discountType === "percent"
          ? processedInvoices.reduce(
              (sum, item) => sum + (item.price * item.quantity * discountPercent) / 100,
              0
            )
          : processedInvoices.reduce((sum, item) => sum + item.discount_per_item * item.quantity, 0);
  
      // Payload for the backend
      const payload = {
        sales: processedInvoices,
        discount_type: discountType,
        discount_percent: discountPercent,
        total_discount: Math.round(totalDiscount), // Rounded to nearest integer
        payment_id: parseInt(paymentMethod),
        customer_name: customerName,
      };
  
      console.log("Submitting payload:", payload);
  
      const response = await fetch("http://localhost:8080/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit data");
      }
  
      const data = await response.json();
      alert("Invoices submitted successfully!");
      console.log("Response:", data);

      setCustomerName("");
      setPaymentMethod("");
    } catch (error) {
      console.error("Error submitting invoices:", error);
      alert("Failed to submit invoices.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogCancel = () => {
    // Reset customerName and paymentMethod on dialog cancel
    setCustomerName("");
    setPaymentMethod("");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
      <div className="w-full max-w-4xl">
        {/* Discount Selection */}
        <div className="flex justify-end mb-4 mt-[-20px]">
          <Select
            onValueChange={(value) => {
              if (value === "percent") {
                setDiscountType("percent");
              } else if (value === "amount") {
                setDiscountType("amount");
              } else if (value === "none") {
                handleDiscountCancel();
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fitur</SelectLabel>
                <SelectItem value="percent">Diskon %</SelectItem>
                <SelectItem value="amount">Diskon Rp</SelectItem>
                <SelectItem value="none">Cancel</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Diskon % */}
        {discountType === "percent" && (
          <div className="mb-4">
            <label htmlFor="discountPercent" className="font-medium">
              Diskon %:
            </label>
            <Input
              id="discountPercent"
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="ml-2 w-32"
            />
          </div>
        )}

        {/* Diskon Rp */}
        {discountType === "amount" && (
          <div className="mb-4">
            <label htmlFor="discountAmount" className="font-medium">
              Diskon Rp per Item:
            </label>
          </div>
        )}

        {/* Table */}
        <Table className="w-full border border-gray-300 rounded-lg shadow-md bg-white">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[120px] text-center">ID Barang</TableHead>
              <TableHead className="text-center">Harga Satuan</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              {discountType === "amount" && <TableHead className="text-center">Diskon per Item</TableHead>}
              <TableHead className="text-center">Deskripsi</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={invoice.invoice}
                    onChange={(e) => handleInputChange(index, "invoice", e.target.value)}
                    className="text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={invoice.hargaSatuan}
                    onChange={(e) => handleInputChange(index, "hargaSatuan", e.target.value)}
                    className="text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={invoice.jumlah}
                    onChange={(e) => handleInputChange(index, "jumlah", e.target.value)}
                    className="text-center"
                  />
                </TableCell>
                {discountType === "amount" && (
                  <TableCell>
                    <Input
                      value={invoice.discountPerItem}
                      onChange={(e) => handleInputChange(index, "discountPerItem", e.target.value)}
                      className="text-center"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Input
                    value={invoice.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="text-center"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={invoice.total}
                    className="text-center bg-gray-100"
                    readOnly
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeRow(index)}
                    disabled={invoices.length <= 1}
                  >
                    <AiOutlineMinus className="text-lg" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={discountType === "amount" ? 4 : 3} className="text-center font-bold">
                Grand Total
              </TableCell>
              <TableCell className="text-center font-bold">
                {calculateGrandTotal()}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="outline" size="icon" onClick={addRow}>
                  <AiOutlinePlus className="text-lg" />
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Confirm Button with Customer Input Dialog */}
        <div className="mt-6 flex justify-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-48" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Konfirmasi"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Masukkan Data Pelanggan</DialogTitle>
                <DialogDescription>Harap isi nama pelanggan dan metode pembayaran.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerName" className="text-right">Nama</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentMethod" className="text-right">Pembayaran</Label>
                  <Input
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsConfirmDialogOpen(true)}>Lanjut</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Penjualan</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin mengirimkan data ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <Button onClick={handleDialogCancel} variant="outline">
              Batal
            </Button>
              <AlertDialogAction onClick={handleConfirm}>Lanjutkan</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
