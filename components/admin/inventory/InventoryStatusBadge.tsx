"use client";
import { Badge } from "@/components/ui/badge";

export function InventoryStatusBadge({
  status,
}: {
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED" | "INACTIVE";
}) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      );
    case "OUT_OF_STOCK":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          Out of Stock
        </Badge>
      );
    case "DISCONTINUED":
      return (
        <Badge className="bg-red-500 hover:bg-red-600">Discontinued</Badge>
      );
    case "INACTIVE":
      return <Badge className="bg-red-500 hover:bg-red-600">INACTIVE</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
}
