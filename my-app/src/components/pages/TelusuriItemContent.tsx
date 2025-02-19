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

// Define Sales Data Type based on Backend Schema
export type Sale = {
  sale_id: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
  discount_per_item: number;
  transaction_id: number;
  item_id: string;
};

export default function TelusuriItemContent() {
  const [data, setData] = React.useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [error, setError] = React.useState<string | null>(null);

  // Fetch data from API on mount
  React.useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/sales", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch sales data");
        }

        const sales = await response.json();
        if (sales && sales.data && Array.isArray(sales.data))
        setData(sales.data);
      } catch (err) {
        setError("Error fetching sales data. Please try again.");
        console.error(err);
      }
    };

    fetchSalesData();
  }, []);

  // Filter data based on search query (Item ID)
  const filteredData = React.useMemo(
    () =>
      data.filter((sale) =>
        sale.item_id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [data, searchQuery]
  );

  // Columns Definition
  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: "sale_id",
      header: "No. Penjualan",
      cell: ({ row }) => <div>{row.getValue("sale_id")}</div>,
    },
    {
      accessorKey: "item_id",
      header: "Kode Barang",
      cell: ({ row }) => <div>{row.getValue("item_id")}</div>,
    },
    {
      accessorKey: "description",
      header: "Keterangan",
      cell: ({ row }) => <div className="capitalize">{row.getValue("description")}</div>,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
    },
    {
      accessorKey: "price",
      header: "Harga",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "discount_per_item",
      header: "Discount (Rp)",
      cell: ({ row }) => <div className="text-center">{row.getValue("discount_per_item")}</div>,
    },
    {
      accessorKey: "transaction_id",
      header: "No. Faktur",
      cell: ({ row }) => <div className="text-center">{row.getValue("transaction_id")}</div>,
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
  });

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-4xl">
        {/* Display error message if fetch fails */}
        {error && <div className="text-red-500 text-center py-2">{error}</div>}

        {/* Search Bar for Filtering */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Telusuri Penjualan dengan Kode Barang..."
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
                      <TableCell
                        key={cell.id}
                        className={cell.column.id === "description" ? "capitalize text-left" : "text-center"}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
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