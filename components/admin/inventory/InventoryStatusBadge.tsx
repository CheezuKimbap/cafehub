"use client";
import { Badge } from "@/components/ui/badge";

export function InventoryStatusBadge({
  status,
}: {
  status: "AVAILABLE" | "NOT_AVAILABLE";
}) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      );
    case "NOT_AVAILABLE":
      return (
        <Badge className="bg-red-500 hover:bg-red-600">Not Available</Badge>
      );

    default:
      return <Badge>Unknown</Badge>;
  }
}
