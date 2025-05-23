"use client";

import { useState, useEffect } from "react";
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
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";


// Define the InventoryItem type
interface InventoryItem {
  item_id: string;
  price: number;
  description: string;
  quantity: string;
}

interface locations{
    location: "toko" | "tiktok" | "gudang";
}


export default function PenjualanContent({ location }: locations) {

  const [invoices, setInvoices] = useState([
    { invoice: "", hargaSatuan: "Rp.0", jumlah: "1", discountPerItem: "0", total: "Rp.0", description: "", stock: "" },
  ]);

  const [discountType, setDiscountType] = useState<"none" | "percent" | "amount" | "total" >("none");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [totalTotalDiscount, setTotalTotalDiscount] = useState<number>(0);
  const [focusedRow, setFocusedRow] = useState<number | null>(null); 
  const [inventory, setInventory] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDPDialogOpen, setIsDPDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [dpAmount, setDpAmount] = useState<number>(0);


  // Fetch inventory on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`http://103.185.52.233:8080/api/inventory/${location}`);
        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }
        const data = await response.json();
        setInventory(data.data || []);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, [location]);

  const parsePrice = (value: string | undefined): number => {
    if (!value) return 0;
  
    const numericValue = parseFloat(value.replace(/Rp\.|\./g, "").replace(/,/g, "")) || 0;
  
    return numericValue;
  };

  // Function to format as Rp. currency
  const formatRupiah = (value: number): string => {
    return `Rp.${value.toLocaleString("id-ID")}`;
  };

  // Handle input changes
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedInvoices = [...invoices];
    updatedInvoices[index] = { ...updatedInvoices[index], [field]: value };

    if (field === "jumlah") {
      const quantity = parseInt(value) || 0;
      const stockAvailable = parseInt(updatedInvoices[index].stock) || 0;
  
      // Prevent quantity from exceeding stock
      if (quantity > stockAvailable) {
        alert(`Jumlah tidak boleh lebih dari stok yang tersedia (${stockAvailable}).`);
        updatedInvoices[index].jumlah = stockAvailable.toString(); // Set to max available stock
      }
    }

    // Recalculate total when hargaSatuan, jumlah, or discount changes
    if (["hargaSatuan", "jumlah", "discountPerItem"].includes(field)) {
      const price = parsePrice(updatedInvoices[index].hargaSatuan);
      const quantity = parseInt(updatedInvoices[index].jumlah) || 0;
      const discount = parsePrice(updatedInvoices[index].discountPerItem);

      const newTotal = price * quantity - discount * quantity;

      updatedInvoices[index].total = formatRupiah(Math.max(newTotal, 0));
    }
    setInvoices(updatedInvoices);
  };

  // Handle item search when user types item_id
  const handleItemSearch = (index: number, value: string) => {
    setInvoices((prev) => {
      const updatedInvoices = [...prev];
      updatedInvoices[index].invoice = value;

      // Filter inventory to show matching items
      const filtered = inventory.filter((item: InventoryItem) =>
        item.item_id.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
      setFocusedRow(index);

      return updatedInvoices;
    });
  };

  // Handle selection from dropdown and autofill hargaSatuan
  const handleSelectItem = (index: number, item: InventoryItem) => {
    setInvoices((prev) => {
      const updatedInvoices = [...prev];
      updatedInvoices[index].invoice = item.item_id;
      updatedInvoices[index].hargaSatuan = formatRupiah(item.price);
      updatedInvoices[index].description = item.description;
      updatedInvoices[index].stock = item.quantity;
      setFilteredItems([]); // Clear dropdown after selection
      setFocusedRow(null);
      return updatedInvoices;
    });
  };

  // Add a new row
  const addRow = () => {
    setInvoices([
      ...invoices,
      { invoice: "", hargaSatuan: "Rp.0", jumlah: "1", discountPerItem: "0", total: "Rp.0", description: "" , stock: "0"},
    ]);
  };

  // Remove a row
  const removeRow = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = (): string => {
    
    let subtotal = invoices.reduce((sum, row) => {
      const price = parsePrice(row.hargaSatuan);
      const quantity: number = isNaN(parseInt(row.jumlah)) ? 0 : parseInt(row.jumlah);
      const discountPerItem = parseFloat(row.discountPerItem) || 0;
  
      // Ensure discount is properly multiplied by quantity
      const total = price * quantity - discountPerItem * quantity;
  
      return sum + total;
    }, 0);

    if (discountType === "percent" && discountPercent > 0) {
      const discountValue = (subtotal * discountPercent) / 100;
      subtotal -= discountValue;
    }

    else if (discountType == "total" && totalTotalDiscount > 0){
      subtotal -= totalTotalDiscount;
    }
  
    // Convert subtotal to ensure exactly 3 decimal places (thousands format)
    const formattedSubtotal = (subtotal).toFixed(3);
  
    return `Rp.${parseFloat(formattedSubtotal).toLocaleString("id-ID")}`;
  };

  const handleProceedToPayment = () => {
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmSale = async () => {
    setIsConfirmDialogOpen(false);
    const processedInvoices = invoices.map(({ invoice, hargaSatuan, jumlah, discountPerItem, description, total }) => ({
      item_id: invoice,
      price: parsePrice(hargaSatuan),
      quantity: parseInt(jumlah),
      discount_per_item: parsePrice(discountPerItem),
      description: description,
      total: parsePrice(total),
    }));

    const subtotal = processedInvoices.reduce((sum, item) => sum + item.total, 0);

    // Calculate total discount based on discount type
    let totalDiscount = 0;
    if (discountType === "amount") {
      totalDiscount = processedInvoices.reduce(
        (sum, item) => sum + (item.discount_per_item * item.quantity),
        0
      );
    } else if (discountType === "percent") {
        totalDiscount = (subtotal * discountPercent) / 100;
    } else if (discountType == "total"){
        totalDiscount = totalTotalDiscount;
    }

    const totalPrice = parsePrice(calculateGrandTotal());

    
    const payload = {
      sales: processedInvoices,
      discount_type: discountType,
      discount_percent: discountPercent,
      total_discount: totalDiscount,
      payment_id: parseInt(paymentMethod),
      payment_status: paymentStatus,
      customer_name: customerName,
      total_price: totalPrice,
      location: location,
      down_payment: dpAmount,
    };
    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch("http://103.185.52.233:8080/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to process transaction");
      alert("Sale successful!");
      setDiscountType("none");
      setInvoices([
        { invoice: "", hargaSatuan: "Rp.0", jumlah: "1", discountPerItem: "0", total: "Rp.0", description: "", stock: "" },
      ]);
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed!");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[85vh] mt-[-40px]">
      <div className="w-full max-w-5xl">
        {/* Discount Selection */}
        <div className="flex justify-end mb-4">
          <Select
            onValueChange={(value) => {
              setDiscountPercent(0);
              setTotalTotalDiscount(0);
              setInvoices(invoices.map((invoice) => ({ ...invoice, discountPerItem: "0" }))); // Reset discount per item
              if (value === "percent") {
                setDiscountType("percent");      
              } else if (value === "amount") {
                setDiscountType("amount");
              } else if (value == "total"){
                setDiscountType("total");
              } else {
                setDiscountType("none");
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pillihan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fitur</SelectLabel>
                <SelectItem value="percent">Diskon %</SelectItem>
                <SelectItem value="amount">Diskon Per Pc</SelectItem>
                <SelectItem value="total">Diskon Total</SelectItem>
                <SelectItem value="none">Cancel</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* Diskon % */}
        {discountType === "percent" && (
          <div className="mb-4">
            <label className="font-medium">Diskon %:</label>
            <Input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="ml-2 w-32"
            />
          </div>
        )}

        {discountType === "total" && (
          <div className="mb-4">
            <label className="font-medium">Diskon Total:</label>
            <Input
              type="number"
              value={totalTotalDiscount}
              onChange={(e) => setTotalTotalDiscount(parseFloat(e.target.value) || 0)}
              className="ml-2 w-32"
            />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Barang</TableHead>
              <TableHead>Harga Satuan</TableHead>
              <TableHead>Jumlah</TableHead>
              {discountType === "amount" && <TableHead>Diskon per Item</TableHead>}
              <TableHead>Deskripsi</TableHead>
              <TableHead>Sisa Stock</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={invoice.invoice}
                    onChange={(e) => handleItemSearch(index, e.target.value)}
                    className="text-center"
                    placeholder="Isi ID Barang..."
                    onFocus={() => setFocusedRow(index)} // Show dropdown only for this row
                    onBlur={() => setTimeout(() => setFocusedRow(null), 200)} // Hide after selection
                  />
                  {focusedRow === index && filteredItems.length > 0 &&(
                    <div className="absolute bg-white border shadow-md w-full max-h-40 overflow-y-auto z-10">
                      {filteredItems.map((item: InventoryItem) => (
                        <div
                          key={item.item_id}
                          className="p-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleSelectItem(index, item)}
                        >
                          {item.item_id} - {item.description} (sisa {item.quantity})
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell><Input value={invoice.hargaSatuan} readOnly /></TableCell>
                <TableCell>
                  <Input
                    value={invoice.jumlah}
                    onChange={(e) => handleInputChange(index, "jumlah", e.target.value)}
                  />
                </TableCell>
                {discountType === "amount" && (
                  <TableCell><Input value={invoice.discountPerItem} onChange={(e) => handleInputChange(index, "discountPerItem", e.target.value)} /></TableCell>
                )}
                <TableCell>
                  <Input
                    value={invoice.description} 
                    readOnly
                  />
                </TableCell>

                <TableCell><Input value={invoice.stock} readOnly /></TableCell>
                <TableCell>
                  <Button variant="destructive" onClick={() => removeRow(index)} disabled={invoices.length <= 1}>
                    <AiOutlineMinus />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
              <TableCell className="font-bold">{calculateGrandTotal()}</TableCell>
              <TableCell>
                <Button variant="outline" size="icon" onClick={addRow}>
                  <AiOutlinePlus />
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <Button className="mt-4" onClick={handleProceedToPayment}>Proceed to Payment</Button>

            {/* Payment Input Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
            <DialogTitle>Enter Payment Details</DialogTitle>

            {/* Customer Name Input */}
            <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
            />

            {/* Payment Method Dropdown */}
            <label className="block text-sm font-medium mt-2">Payment Method</label>
            <Select onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Pillih Metode Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                <SelectGroup>
                    <SelectLabel>Metode Pembayaran</SelectLabel>
                    <SelectItem value="1">Tunai</SelectItem>
                    <SelectItem value="2">Debit</SelectItem>
                    <SelectItem value="3">Transfer</SelectItem>
                    <SelectItem value="4">Cek / GIRO</SelectItem>
                    <SelectItem value="5">QR</SelectItem>
                    <SelectItem value="6">Hutang</SelectItem>
                    <SelectItem value="7">DP</SelectItem>
                </SelectGroup>
                </SelectContent>
            </Select>

            {/* Payment Status Dropdown */}
            <label className="block text-sm font-medium mt-2">Status Pembayaran</label>
            <Select onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Pillih Status Pembayaran" />
                </SelectTrigger>
                <SelectContent>
                <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="belom lunas">Belom Lunas</SelectItem>
                </SelectGroup>
                </SelectContent>
            </Select>

            {/* Confirm Button */}
            <DialogFooter>
                <Button
                onClick={() => {
                    if (!paymentMethod) {
                    alert("❌ Please select a payment method.");
                    return;
                    }
                    if (paymentMethod === "7") {
                        // If DP is selected, open DP dialog instead of confirming sale immediately.
                        setIsPaymentDialogOpen(false);
                        setIsDPDialogOpen(true);
                    } else {
                        setIsPaymentDialogOpen(false);
                        setIsConfirmDialogOpen(true);
                    }
                }}
                >
                Confirm
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* DP Dialog for Down Payment */}
        <Dialog open={isDPDialogOpen} onOpenChange={setIsDPDialogOpen}>
          <DialogContent>
            <DialogTitle>Enter DP Details</DialogTitle>
            <Input
              type="number"
              placeholder="Enter DP Amount"
              value={dpAmount}
              onChange={(e) => setDpAmount(parseFloat(e.target.value) || 0)}
              className="mt-2"
            />
            <div className="mt-2">
              Sisa: Rp.{" "}
              {(() => {
                const total = parsePrice(calculateGrandTotal());
                const sisa = total - dpAmount;
                return sisa.toLocaleString("id-ID");
              })()}
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  setIsDPDialogOpen(false);
                  setIsConfirmDialogOpen(true);
                }}
              >
                Confirm DP
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      {/* Final Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to make this sale?</DialogTitle>
          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSale}>Yes, Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      </div>
    </div>
  );
}