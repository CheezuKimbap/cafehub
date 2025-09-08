"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
type OrderStatus = "pending" | "preparing" | "ready" | "pickedup";
type Order = {
  id: string;
  customer: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
};
export default function BaristaBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    setOrders([
      {
        id: "1",
        customer: "Alice",
        items: [
          { name: "Cappuccino", qty: 1 },
          { name: "Croissant", qty: 2 },
        ],
        status: "pending",
      },
      {
        id: "2",
        customer: "Bob",
        items: [{ name: "Latte", qty: 1 }],
        status: "preparing",
      },
      {
        id: "3",
        customer: "Charlie",
        items: [{ name: "Espresso", qty: 2 }],
        status: "ready",
      },
    ]);
  }, []);
  const updateStatus = (id: string, next: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o))
    );
  };
  const columns: { key: OrderStatus; title: string }[] = [
    { key: "pending", title: "Pending" },
    { key: "preparing", title: "Preparing" },
    { key: "ready", title: "Ready for Pickup" },
    { key: "pickedup", title: "Completed" },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {" "}
      {columns.map((col) => (
        <div key={col.key} className="space-y-4">
          {" "}
          <h2 className="text-lg font-semibold">{col.title}</h2>{" "}
          {orders
            .filter((o) => o.status === col.key)
            .map((order) => (
              <Card key={order.id} className="shadow-md">
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle className="flex justify-between items-center">
                    {" "}
                    <span>#{order.id}</span> <Badge>{order.status}</Badge>{" "}
                  </CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <p className="font-medium text-sm">{order.customer}</p>{" "}
                  <ul className="my-2 text-xs space-y-1">
                    {" "}
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {" "}
                        {item.qty}x {item.name}{" "}
                      </li>
                    ))}{" "}
                  </ul>{" "}
                  {order.status === "pending" && (
                    <Button
                      onClick={() => updateStatus(order.id, "preparing")}
                      className="w-full mt-2"
                    >
                      {" "}
                      Start Preparing{" "}
                    </Button>
                  )}{" "}
                  {order.status === "preparing" && (
                    <Button
                      onClick={() => updateStatus(order.id, "ready")}
                      className="w-full mt-2"
                      variant="secondary"
                    >
                      {" "}
                      Mark Ready{" "}
                    </Button>
                  )}{" "}
                  {order.status === "ready" && (
                    <Button
                      onClick={() => updateStatus(order.id, "pickedup")}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      {" "}
                      Mark Picked Up{" "}
                    </Button>
                  )}{" "}
                </CardContent>{" "}
              </Card>
            ))}{" "}
        </div>
      ))}{" "}
    </div>
  );
}
