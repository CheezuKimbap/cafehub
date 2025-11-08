"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/redux/features/products/product";
import { InventoryStatusBadge } from "./InventoryStatusBadge";
import { Button } from "@/components/ui/button";
import { ProductEditButton } from "./EditProduct";

// Define columns for the Product table
export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.original.name}</span>,
  },

  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => (
      <span>{new Date(row.original.updatedAt).toLocaleDateString()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "In Store",
    cell: ({ row }) => <InventoryStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
         <ProductEditButton product={row.original} />

      </div>
    ),
  },
];
