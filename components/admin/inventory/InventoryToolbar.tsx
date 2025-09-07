"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function InventoryToolbar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <Input
        placeholder="Search products..."
        className="w-1/3"
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button className="flex items-center gap-2">
        <Plus size={16} />
        Add Product
      </Button>
    </div>
  );
}
