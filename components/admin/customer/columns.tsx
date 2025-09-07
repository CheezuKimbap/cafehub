// customerColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/redux/features/customer/customer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const customerColumns: ColumnDef<Customer>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) =>
      `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim() ||
      "-",
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "profile",
    header: "Profile",
    cell: ({ row }) =>
      row.original.profile ? (
        <div>
          <div>Phone: {row.original.profile.phoneNumber}</div>
          <div>Address: {row.original.profile.address}</div>
        </div>
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "orders",
    header: "Orders",
    cell: ({ row }) => row.original.orders?.length ?? 0,
  },
  {
    id: "totalSpend",
    header: "Total Spend",
    cell: ({ row }) =>
      `$${(
        row.original.orders?.reduce((sum, o) => sum + o.totalAmount, 0) ?? 0
      ).toLocaleString()}`,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/customer/${row.original.id}`)}
        >
          View
        </Button>
      );
    },
  },
];
