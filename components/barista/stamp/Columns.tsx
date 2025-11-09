import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/redux/features/customer/customer";
import {StampDialog } from "./AddStamp"; // import the new component

export const customerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() || "-",
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "currentStamps",
    header: "Current Stamps",
    cell: ({ row }) => row.original.currentStamps ?? 0,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex gap-2">
         <StampDialog customerId={customer.id} />
        </div>
      );
    },
  },
];
