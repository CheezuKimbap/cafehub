"use client";

import { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/components/barista/OrderCard";
import { OrderColumn } from "@/components/barista/OrderColumn";

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
      {columns.map((col) => (
        <OrderColumn
          key={col.key}
          title={col.title}
          status={col.key}
          orders={orders}
          onUpdateStatus={updateStatus}
        />
      ))}
    </div>
  );
}
