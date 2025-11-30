"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Warehouse, CupSoda } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { fetchStock } from "@/redux/features/stock/stocksSlice";

export function InventorySummary() {
  const dispatch = useAppDispatch();

  // Fetch stock on mount (fixes stale or missing data)
  useEffect(() => {
    dispatch(fetchStock());
  }, [dispatch]);

  const { items } = useAppSelector((state) => state.products);
  const stock = useAppSelector((state) => state.stock.stock);

  const totalProducts = items.length;
  const paperCups = stock?.paperCupCount ?? 0;
  const plasticCups = stock?.plasticCupCount ?? 0;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">

      {/* Total Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Products</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </CardContent>
      </Card>

      {/* Paper Cups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paper Cups</CardTitle>
          <Warehouse className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{paperCups}</div>
        </CardContent>
      </Card>

      {/* Plastic Cups */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Plastic Cups</CardTitle>
          <CupSoda className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{plasticCups}</div>
        </CardContent>
      </Card>

    </div>
  );
}
