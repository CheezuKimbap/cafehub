"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/redux/hook";

export function InventorySummary() {
  const { items } = useAppSelector((state) => state.products);

  const totalProducts = items.length;
  const inStore = items.filter(
    (p) => p.status === "AVAILABLE" && (p.stock ?? 0) > 0
  ).length;

  const lowStock = items.filter(
    (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5
  ).length;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Products</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Store</CardTitle>
          <Warehouse className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inStore}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{lowStock}</div>
        </CardContent>
      </Card>
    </div>
  );
}
