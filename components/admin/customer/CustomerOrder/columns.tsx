// latestOrderColumns.ts
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/redux/features/order/order"; // adjust path
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export const latestOrderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderItems",
    header: "Product",
    cell: ({ row }) =>
      row.original.orderItems
        .map((item) => item.variant.product.name)
        .join(", "),
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.orderDate), "MMM dd, yyyy"),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) =>
      `${row.original.customer?.firstName ?? ""} ${
        row.original.customer?.lastName ?? ""
      }`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          className={
            status === "COMPLETED"
              ? "bg-green-500 text-white"
              : status === "PENDING"
                ? "bg-yellow-500 text-black"
                : "bg-gray-300 text-black"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "payment",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.paymentMethod?.type ?? "-"}</span>
        {row.original.paymentStatus === "PAID" ? (
          <Badge className="bg-green-500 text-white">Paid</Badge>
        ) : (
          <Badge className="bg-red-500 text-white">Unpaid</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right">{peso.format(row.original.totalAmount)}</div>
    ),
  },
];
