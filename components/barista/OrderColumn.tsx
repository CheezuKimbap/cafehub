"use client";

import { Order, OrderStatus, OrderCard } from "./OrderCard";

type OrderColumnProps = {
  title: string;
  status: OrderStatus;
  orders: Order[];
  onUpdateStatus: (id: string, next: OrderStatus) => void;
};

export function OrderColumn({
  title,
  status,
  orders,
  onUpdateStatus,
}: OrderColumnProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {orders
        .filter((o) => o.status === status)
        .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) // 👈 ASC
        .map((order) => (
            <OrderCard
            key={order.id}
            order={order}
            onUpdateStatus={onUpdateStatus}
            />
        ))}
    </div>
  );
}
