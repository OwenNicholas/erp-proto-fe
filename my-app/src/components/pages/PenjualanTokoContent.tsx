"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

// Sample initial data
const initialInvoices = [
  { invoice: "INV001", hargaSatuan: "$250.00", jumlah: "1", total: "$250.00" },
  { invoice: "INV002", hargaSatuan: "$150.00", jumlah: "2", total: "$300.00" },
];

export default function PenjualanTokoContent() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to safely parse a price string into a number
  const parsePrice = (value: string | undefined): number => {
    if (!value) return 0; // If undefined or empty, return 0
    return parseFloat(value.replace("$", "")) || 0; // Remove $ sign and convert
  };

  // Handle input changes
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInvoices = [...invoices];
    updatedInvoices[index] = { ...updatedInvoices[index], [field]: value };

    // Recalculate total when hargaSatuan or jumlah changes
    if (field === "hargaSatuan" || field === "jumlah") {
      const price = parsePrice(updatedInvoices[index].hargaSatuan);
      const quantity = parseInt(updatedInvoices[index].jumlah) || 0;
      updatedInvoices[index].total = `$${(price * quantity).toFixed(2)}`;
    }

    setInvoices(updatedInvoices);
  };

  // Add a new row
  const addRow = () => {
    setInvoices([
      ...invoices,
      { invoice: `INV00${invoices.length + 1}`, hargaSatuan: "$0.00", jumlah: "1", total: "$0.00" },
    ]);
  };

  // Remove a row
  const removeRow = (index: number) => {
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
  };

  // Confirm and send to backend
  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      console.log("Submitting Invoices:", invoices);
      /*
      const response = await fetch("http://127.0.0.1:8000/api/invoices/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoices }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      const data = await response.json();
      alert("Invoices submitted successfully!");
      console.log("Response:", data);
      */
    } catch (error) {
      console.error("Error submitting invoices:", error);
      alert("Failed to submit invoices.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
      <div className="w-full max-w-4xl">
        <Table className="w-full border border-gray-300 rounded-lg shadow-md bg-white">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[120px] text-center">ID Barang</TableHead>
              <TableHead className="text-center">Harga Satuan</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
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
              <TableCell colSpan={3} className="text-center font-bold">Total</TableCell>
              <TableCell className="text-center font-bold">
                {`$${invoices.reduce((sum, row) => sum + parsePrice(row.total), 0).toFixed(2)}`}
              </TableCell>
              <TableCell className="text-center">
                <Button variant="outline" size="icon" onClick={addRow}>
                  <AiOutlinePlus className="text-lg" />
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Confirm Button */}
        <div className="mt-6 flex justify-center">
          <Button
            className="w-48"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Submitting..." : "Konfirmasi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
