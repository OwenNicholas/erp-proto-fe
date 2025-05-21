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
  quantity_retur: number;
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
  const [discounts, setDiscounts] = React.useState<{ [key: number]: number }>({});

  // Fetch data from API on mount
  React.useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch("http://103.185.52.233:8080/api/sales", {
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

  React.useEffect(() => {
    const fetchTotalDiscounts = async () => {
      try {
        const response = await fetch("http://103.185.52.233:8080/api/transactions/discount_percent"); // Fetch all discounts at once
        if (!response.ok) {
          throw new Error(`Failed to fetch discounts. Status: ${response.status}`);
        }
  
        const responseData = await response.json();
  
        if (!responseData || typeof responseData !== "object" || !responseData.data || !Array.isArray(responseData.data)) {
          throw new Error("Invalid data format: Expected an object with a 'data' array");
        }
  
        // Transform response into an object { transaction_id: discount_percent }
        const discountMap: { [key: number]: number } = {};
        responseData.data.forEach((item: { transaction_id: number; discount_percent: number }) => {
          if (typeof item.transaction_id === "number" && typeof item.discount_percent === "number") {
            discountMap[item.transaction_id] = item.discount_percent;
          }
        });
  
        setDiscounts(discountMap); // Store all discounts in state once
      } catch (error) {
        console.error("Error fetching discounts:", error);
      }
    };
  
    fetchTotalDiscounts();
  }, []); // Runs only once when the component mounts
  // Filter data based on search query (Item ID)
  const filteredData = React.useMemo(() => {
    return data
      .filter((sale) =>
        sale.item_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.sale_id - a.sale_id); // Sorting in descending order
  }, [data, searchQuery]);

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
      accessorKey: "quantity_retur",
      header: "Quantity Retur",
      cell: ({ row }) => <div className="text-center">{row.getValue("quantity_retur")}</div>,
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
        // Get transaction ID
        const transactionId = row.getValue("transaction_id") as number;
        const totalDiscount = discounts[transactionId] ?? 0; // ✅ Default to 0 if undefined
    
        // Get row values
        const quantity = Number(row.getValue("quantity")) || 0;
        const quantityRetur = Number(row.getValue("quantity_retur")) || 0;
        const price = Number(row.getValue("price")) || 0;
        const discountPerItem = Number(row.getValue("discount_per_item")) || 0;
    
        // Compute subtotal
        const netQuantity = Math.max(quantity - quantityRetur, 0);
        const subtotal = netQuantity * price;
    
        // Apply the correct discount
        const itemDiscount = discountPerItem > 0 ? discountPerItem * netQuantity : 0;
        const percentageDiscount = discountPerItem === 0 && totalDiscount > 0 ? (subtotal * totalDiscount) / 100 : 0;
        const totalDiscountAmount = itemDiscount + percentageDiscount;
    
        // Final total
        const totalAmount = subtotal - totalDiscountAmount;
    
        // Format as IDR currency
        const formattedTotal = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(totalAmount);
    
        return <div className="text-right font-medium">{formattedTotal}</div>;
      },
    },
    {
      accessorKey: "discount_per_item",
      header: "Discount Per Pc (Rp)",
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