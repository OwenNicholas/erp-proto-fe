"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Transaction Data Type
export type Transaction = {
  transaction_id: number;
  discount_type: string;
  discount_percent: number;
  total_discount: number;
  payment_id: number;
  payment_status: string;
  customer_name: string;
  timestamp: string;
  location: string;
  total_price: number;
  down_payment: number;
};

export default function TransactionHistoryContent() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [error, setError] = React.useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = React.useState("");
  const [newPaymentStatus, setNewPaymentStatus] = React.useState("");

  const paymentMethodsMap: Record<number, string> = {
    1: "Tunai",
    2: "Debit",
    3: "Transfer",
    4: "Cek / GIRO",
    5: "QR",
    6: "Hutang",
    7: "DP",
  };

  // Fetch transaction history from API
  React.useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/transactions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions (Status: ${response.status})`);
        }

        const result = await response.json();

        console.log("🔹 API Response:", result); // ✅ Debugging: Log response

        if (result && result.data && Array.isArray(result.data)) {
          setData(result.data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError("Error fetching transaction history. Please try again.");
        console.error(err);
      }
    };

    fetchTransactionHistory();
  }, []);

  // 🔹 Filter transactions based on search query (customer name)
  const filteredData = React.useMemo(
    () =>
      data.filter((transaction) =>
        transaction.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.transaction_id - a.transaction_id),
    [data, searchQuery]
  );

  // 🔹 Define Table Columns
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "transaction_id",
      header: "No. Faktur",
      cell: ({ row }) => <div>{row.getValue("transaction_id")}</div>,
    },
    {
      accessorKey: "customer_name",
      header: "Nama Pembeli",
      cell: ({ row }) => <div className="capitalize">{row.getValue("customer_name")}</div>,
    },
    {
      accessorKey: "discount_type",
      header: "Tipe Discount",
      cell: ({ row }) => <div className="text-center">{row.getValue("discount_type")}</div>,
    },
    {
      accessorKey: "discount_percent",
      header: "Discount (%)",
      cell: ({ row }) => <div className="text-center">{row.getValue("discount_percent")} %</div>,
    },
    {
      accessorKey: "total_discount",
      header: "Total Discount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_discount"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "total_price",
      header: () => <div className="text-right">Total</div>, // Align header
      cell: ({ row }) => (
        <div className="text-right">
          Rp. {row.getValue("total_price")}
        </div>
      ),
    },
    {
      accessorKey: "payment_id",
      header: "Metode Pembayaran",
      cell: ({ row }) => {
        const paymentId = row.getValue("payment_id") as number;
        return <div className="text-center">{paymentMethodsMap[paymentId] || "Unknown"}</div>;
      },
    },
    {
      accessorKey: "down_payment",
      header: "Terbayar",
      cell: ({ row }) => {
        const paymentId = row.getValue("payment_id") as number;
        const totalPrice = row.getValue("total_price") as number;
        const downPayment = row.getValue("down_payment") as number;
        
        return (
          <div className="text-right">
            Rp. {paymentId === 7 ? downPayment : totalPrice}
          </div>
        );
      },
    },
    {
      accessorKey: "sisa",
      header: "Sisa",
      cell: ({ row }) => {
        const paymentId = row.getValue("payment_id") as number;
        const total = row.getValue("total_price") as number;
        const down = row.getValue("down_payment") as number;
        
        if (paymentId === 7) {
          const sisa = total - down;
          return <div className="text-right">Rp. {sisa.toLocaleString("id-ID")}</div>;
        }
        return <div className="text-right">Rp. 0</div>;
      },
    },
    {
      accessorKey: "payment_status",
      header: "Status Pembayaran",
      cell: ({ row }) => <div className="text-center">{row.getValue("payment_status")}</div>,
    },
    {
      accessorKey: "timestamp",
      header: "Tanggal & Waktu",
      cell: ({ row }) => {
        const rawTimestamp = row.getValue("timestamp") as string; // Ensure it's a string
    
        // Handle missing or invalid timestamp
        if (!rawTimestamp) {
          return <div className="text-center text-red-500">Invalid Date</div>;
        }
    
        // Convert to Date object
        const date = new Date(rawTimestamp);
    
        // Ensure valid date before formatting
        if (isNaN(date.getTime())) {
          return <div className="text-center text-red-500">Invalid Date</div>;
        }
  
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
    
        // Final formatted timestamp
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
        return <div className="text-center">{formattedDate}</div>;
      },
    }
  ];

  const handleUpdatePaymentStatus = async () => {
    if (!selectedTransactionId || !newPaymentStatus) {
      alert("❌ Transaction ID dan Status Pembayaran harus dipilih!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/transactions/payment/${selectedTransactionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status pembayaran");
      }

      alert("✅ Status pembayaran berhasil diperbarui!");
      setIsDialogOpen(false);
      setSelectedTransactionId("");
      setNewPaymentStatus("");

      // Refresh Data
      const updatedResponse = await fetch("http://localhost:8080/api/transactions");
      const updatedResult = await updatedResponse.json();
      setData(updatedResult.data);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("❌ Gagal memperbarui status pembayaran. Coba lagi.");
    }
  };

  // Create Table Instance
  const table = useReactTable({
    data: filteredData, // Uses memoized data
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    initialState: { pagination: { pageSize: 50 } },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">History Transaksi</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span>Koreksi Status Pembayaran</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Koreksi Status Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. Faktur</label>
                <Input
                  placeholder="Masukkan No. Faktur"
                  value={selectedTransactionId}
                  onChange={(e) => setSelectedTransactionId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Pembayaran</label>
                <Select onValueChange={(value) => setNewPaymentStatus(value)} value={newPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="belum lunas">Belum Lunas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleUpdatePaymentStatus}>Konfirmasi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Input
          placeholder="Cari transaksi..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="max-w-md"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto flex items-center gap-2">
              <span>Kolom</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                    Tidak ada data yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}