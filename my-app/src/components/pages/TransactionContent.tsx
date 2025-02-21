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
};

export default function TransactionHistoryContent() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [error, setError] = React.useState<string | null>(null);

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
      accessorKey: "payment_id",
      header: "Payment ID",
      cell: ({ row }) => <div className="text-center">{row.getValue("payment_id")}</div>,
    },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      cell: ({ row }) => <div className="text-center">{row.getValue("payment_status")}</div>,
    },
    {
      accessorKey: "timestamp",
      header: "Tanggal & Waktu",
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.getValue("timestamp")).toLocaleString()}
        </div>
      ),
    },
  ];

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
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-4xl">
        {/* Display error message if fetch fails */}
        {error && <div className="text-red-500 text-center py-2">{error}</div>}

        {/* Search Bar for Filtering */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Cari pakai nama customer..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

        {/* Table */}
        <div className="rounded-md border mx-auto bg-white shadow-md">
          <Table className="table-auto w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results found.
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