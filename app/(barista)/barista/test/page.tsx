"use client";

import React, { useEffect, useState } from "react";
import { Check, Clock, Coffee } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock types
type OrderItem = {
  name: string;
  qty: number;
  notes?: string;
};

type Order = {
  id: string;
  customer?: string;
  items: OrderItem[];
  createdAt: string; // ISO
  status: "queued" | "preparing" | "ready" | "picked_up";
  etaMinutes?: number;
};

// Mock fetcher (replace with real API calls)
const fetchOrders = async (): Promise<Order[]> => {
  await new Promise((r) => setTimeout(r, 250));
  return [
    {
      id: "ORD-1001",
      customer: "Walk-in",
      items: [
        { name: "Cappuccino", qty: 1 },
        { name: "Blueberry Muffin", qty: 1 },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      status: "preparing",
      etaMinutes: 2,
    },
    {
      id: "ORD-1002",
      customer: "Jane D.",
      items: [{ name: "Iced Latte", qty: 2, notes: "No sugar" }],
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: "queued",
      etaMinutes: 6,
    },
    {
      id: "ORD-1003",
      customer: "Pickup - App",
      items: [{ name: "Flat White", qty: 1 }],
      createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
      status: "ready",
    },
  ];
};

export default function OrderSummaryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const markReady = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "ready" } : o)),
    );
  };

  const markPickedUp = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const filtered = orders.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customer || "").toLowerCase().includes(q) ||
      o.items.some((it) => it.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Coffee className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-semibold">Order Summary</h1>
          <p className="text-sm text-muted-foreground">
            Barista dashboard — live orders & statuses
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            placeholder="Search order id, customer or item..."
            value={query}
            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
          <Button onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No orders found.
            </div>
          )}

          {filtered.map((o) => (
            <Card key={o.id}>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>{o.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{o.customer}</p>
                </div>
                <div className="flex items-center gap-2">
                  {o.status === "queued" && <Badge>Queued</Badge>}
                  {o.status === "preparing" && (
                    <Badge variant="secondary">Preparing</Badge>
                  )}
                  {o.status === "ready" && (
                    <Badge variant="destructive">Ready</Badge>
                  )}
                  {o.status === "picked_up" && <Badge>Picked</Badge>}
                  {o.etaMinutes ? (
                    <span className="text-xs ml-2">ETA {o.etaMinutes}m</span>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 mb-4">
                  {o.items.map((it, i) => (
                    <span key={i} className="text-sm">
                      {it.qty} × {it.name} {it.notes ? `— ${it.notes}` : ""}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleTimeString()} —{" "}
                    {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    {o.status !== "ready" && (
                      <Button size="sm" onClick={() => markReady(o.id)}>
                        <Check className="mr-2 h-4 w-4" /> Mark Ready
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markPickedUp(o.id)}
                    >
                      Picked Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total active</span>
                  <span className="font-semibold">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Preparing</span>
                  <span className="font-semibold">
                    {orders.filter((o) => o.status === "preparing").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ready</span>
                  <span className="font-semibold">
                    {orders.filter((o) => o.status === "ready").length}
                  </span>
                </div>
                <Separator />
                <div>
                  <Button onClick={load} className="w-full">
                    <Clock className="mr-2 h-4 w-4" /> Refresh Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button onClick={() => setOrders([])} variant="ghost">
                  Clear All (dev)
                </Button>
                <Button onClick={() => alert("Open settings")}>Settings</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
