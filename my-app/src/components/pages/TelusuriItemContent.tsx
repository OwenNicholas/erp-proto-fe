"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

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

// Define Sales Data Type
export type Sale = {
  item_id: string;
  timestamp: string;
  quantity: number;
  total: number;
  customer_name: string;
};

// 🔹 Dummy Data for Testing (Replace with API Data Later)
const dummyData: Sale[] = [
  {
    item_id: "ITM001",
    timestamp: "2025-02-07T10:00:00Z",
    quantity: 5,
    total: 1250000,
    customer_name: "John Doe",
  },
  {
    item_id: "ITM002",
    timestamp: "2025-02-07T11:30:00Z",
    quantity: 2,
    total: 750000,
    customer_name: "Jane Smith",
  },
  {
    item_id: "ITM003",
    timestamp: "2025-02-07T13:15:00Z",
    quantity: 3,
    total: 450000,
    customer_name: "Alice Brown",
  },
  {
    item_id: "ITM004",
    timestamp: "2025-02-07T15:45:00Z",
    quantity: 1,
    total: 300000,
    customer_name: "Bob Johnson",
  },
  {
    item_id: "ITM005",
    timestamp: "2025-02-07T18:20:00Z",
    quantity: 7,
    total: 2100000,
    customer_name: "Emily White",
  },
];

// Columns Definition
const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "item_id",
    header: "Item ID",
    cell: ({ row }) => <div>{row.getValue("item_id")}</div>,
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("timestamp")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "total",
    header: "Total Price",
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
    accessorKey: "customer_name",
    header: "Customer Name",
    cell: ({ row }) => <div className="capitalize">{row.getValue("customer_name")}</div>,
  },
];

export default function TelusuriItemContent() {
  const [data, setData] = React.useState<Sale[]>(dummyData);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // 🔹 Filter Table Rows Based on Search Query (Item ID) using useMemo
  const filteredData = React.useMemo(
    () =>
      data.filter((sale) =>
        sale.item_id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [data, searchQuery]
  );

  // 🔹 Create Table Instance
  const table = useReactTable({
    data: filteredData, // Uses memoized data
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-3xl"> {/* Center and set max width */}
        {/* Search Bar for Filtering */}
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by Item ID..."
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
                        className={cell.column.id === "customer_name" ? "capitalize text-left" : "text-center"}
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